<?php

declare(strict_types=1);
/**
 * Copyright (c) The Magic , Distributed under the software license
 */

namespace App\Application\ModelGateway\Mapper;

use App\Domain\Flow\Entity\MagicFlowAIModelEntity;
use App\Domain\Flow\Entity\ValueObject\FlowDataIsolation;
use App\Domain\Flow\Entity\ValueObject\Query\MagicFlowAIModelQuery;
use App\Domain\Flow\Service\MagicFlowAIModelDomainService;
use App\Domain\ModelAdmin\Constant\ModelType;
use App\Domain\ModelAdmin\Constant\ServiceProviderCategory;
use App\Domain\ModelAdmin\Constant\ServiceProviderCode;
use App\Domain\ModelAdmin\Entity\ServiceProviderConfigEntity;
use App\Domain\ModelAdmin\Entity\ServiceProviderModelsEntity;
use App\Domain\ModelAdmin\Entity\ValueObject\ServiceProviderConfigDTO;
use App\Domain\ModelAdmin\Entity\ValueObject\ServiceProviderModelsDTO;
use App\Domain\ModelAdmin\Service\ServiceProviderDomainService;
use App\Domain\ModelGateway\Service\ModelConfigDomainService;
use App\ErrorCode\ServiceProviderErrorCode;
use App\Infrastructure\Core\Contract\Model\RerankInterface;
use App\Infrastructure\Core\Exception\ExceptionBuilder;
use App\Infrastructure\Core\ValueObject\Page;
use App\Infrastructure\ExternalAPI\MagicAIApi\MagicAILocalModel;
use DateTime;
use Hyperf\Contract\ConfigInterface;
use Hyperf\Odin\Api\RequestOptions\ApiOptions;
use Hyperf\Odin\Contract\Model\EmbeddingInterface;
use Hyperf\Odin\Contract\Model\ModelInterface;
use Hyperf\Odin\Factory\ModelFactory;
use Hyperf\Odin\Model\AbstractModel;
use Hyperf\Odin\Model\ModelOptions;
use Hyperf\Odin\ModelMapper;
use InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Throwable;

/**
 * 集合项目本身多套的 ModelGatewayMapper - 最终全部转换为 odin model 参数格式.
 */
class ModelGatewayMapper extends ModelMapper
{
    /**
     * 持久化的自定义数据.
     * @var array<string, OdinModelAttributes>
     */
    protected array $attributes = [];

    /**
     * @var array<string, RerankInterface>
     */
    protected array $rerank = [];

    public function __construct(protected ConfigInterface $config, protected LoggerInterface $logger)
    {
        $this->models['chat'] = [];
        $this->models['embedding'] = [];
        parent::__construct($config, $logger);

        // 这里具有优先级的顺序来覆盖配置,后续统一迁移到管理后台
        $this->loadEnvModels();
        // 屏蔽 flow model的加载，使用 ApiModels 平替
        // $this->loadFlowModels();
        $this->loadApiModels();
    }

    public function exist(string $model, ?string $orgCode = null): bool
    {
        if (isset($this->models['chat'][$model]) || isset($this->models['embedding'][$model])) {
            return true;
        }
        return (bool) $this->getByAdmin($model, $orgCode);
    }

    /**
     * 内部使用 chat 时，一定是使用该方法.
     * 会自动替代为本地代理模型.
     */
    public function getChatModelProxy(string $model, ?string $orgCode = null): MagicAILocalModel
    {
        /** @var AbstractModel $odinModel */
        $odinModel = $this->getOrganizationChatModel($model, $orgCode);
        // 转换为代理
        return $this->createProxy($model, $odinModel->getModelOptions(), $odinModel->getApiRequestOptions());
    }

    /**
     * 内部使用 embedding 时，一定是使用该方法.
     * 会自动替代为本地代理模型.
     */
    public function getEmbeddingModelProxy(string $model, ?string $orgCode = null): MagicAILocalModel
    {
        /** @var AbstractModel $odinModel */
        $odinModel = $this->getOrganizationEmbeddingModel($model, $orgCode);
        // 转换为代理
        return $this->createProxy($model, $odinModel->getModelOptions(), $odinModel->getApiRequestOptions());
    }

    /**
     * 该方法获取到的一定是真实调用的模型.
     * 仅 ModelGateway 领域使用.
     * @param string $model 预期是管理后台的 model_id，过度阶段接受传入 model_version
     */
    public function getOrganizationChatModel(string $model, ?string $orgCode = null): ModelInterface
    {
        // 从管理后台获取模型配置
        $odinModel = $this->getByAdmin($model, $orgCode);
        if ($odinModel) {
            return $odinModel->getModel();
        }
        // 最后一次尝试，从被预加载的模型中获取。注意，被预加载的模型是即将被废弃，后续需要迁移到管理后台
        return $this->getChatModel($model);
    }

    /**
     * 该方法获取到的一定是真实调用的模型.
     * 仅 ModelGateway 领域使用.
     * @param string $model 模型名称 预期是管理后台的 model_id，过度阶段接受 model_version
     */
    public function getOrganizationEmbeddingModel(string $model, ?string $orgCode = null): EmbeddingInterface
    {
        $odinModel = $this->getByAdmin($model, $orgCode);
        if ($odinModel) {
            return $odinModel->getModel();
        }
        return $this->getEmbeddingModel($model);
    }

    /**
     * 获取当前组织下的所有可用 chat 模型.
     * @return OdinModel[]
     */
    public function getChatModels(string $organizationCode): array
    {
        return $this->getModelsByType($organizationCode, 'chat');
    }

    /**
     * 获取当前组织下的所有可用 embedding 模型.
     */
    public function getEmbeddingModels(string $organizationCode): array
    {
        return $this->getModelsByType($organizationCode, 'embedding');
    }

    protected function loadEnvModels(): void
    {
        // env 添加的模型增加上 attributes
        /**
         * @var string $name
         * @var AbstractModel $model
         */
        foreach ($this->models['chat'] as $name => $model) {
            $key = strtolower($name);
            $this->attributes[$key] = new OdinModelAttributes(
                key: $key,
                name: $name,
                label: $name,
                icon: '',
                tags: [['type' => 1, 'value' => 'MagicAI']],
                createdAt: new DateTime(),
                owner: 'MagicOdin',
            );
            $this->logger->info('EnvModelRegister', [
                'key' => $key,
                'model' => $model->getModelName(),
                'implementation' => get_class($model),
            ]);
        }
        foreach ($this->models['embedding'] as $name => $model) {
            $name = strtolower($name);
            $this->attributes[$name] = new OdinModelAttributes(
                key: $name,
                name: $name,
                label: $name,
                icon: '',
                tags: [['type' => 1, 'value' => 'MagicAI']],
                createdAt: new DateTime(),
                owner: 'MagicOdin',
            );
            $this->logger->info('EnvModelRegister', [
                'key' => $name,
                'model' => $model->getModelName(),
                'implementation' => get_class($model),
                'vector_size' => $model->getModelOptions()->getVectorSize(),
            ]);
        }
    }

    protected function loadApiModels(): void
    {
        $modelConfigs = di(ModelConfigDomainService::class)->getByModels(['all']);
        foreach ($modelConfigs as $modelConfig) {
            $embedding = str_contains($modelConfig->getModel(), 'embedding');
            // 为了兼容，同时注册 model 和 label。
            // 将 odin 需要的 key 转为小写，对外展示值不变。
            $modelEndpointId = strtolower($modelConfig->getModel());
            $modelType = strtolower($modelConfig->getName());
            try {
                $item = [
                    'model' => $modelEndpointId,
                    'implementation' => $modelConfig->getImplementation(),
                    'config' => $modelConfig->getActualImplementationConfig(),
                    // 以前的配置表没有 embedding 相关的配置，所以这里默认都开启
                    'model_options' => [
                        'chat' => ! $embedding,
                        'function_call' => true,
                        'embedding' => $embedding,
                        'multi_modal' => ! $embedding,
                        'vector_size' => 0,
                    ],
                ];
                $this->addModel($modelEndpointId, $item);
                $this->addModel($modelType, $item);
                $this->addAttributes(
                    key: $modelEndpointId,
                    attributes: new OdinModelAttributes(
                        key: $modelEndpointId,
                        name: $modelConfig->getName(),
                        label: $modelConfig->getName(),
                        icon: '',
                        tags: [['type' => 1, 'value' => 'MagicAI']],
                        createdAt: $modelConfig->getCreatedAt(),
                        owner: 'MagicAI',
                    )
                );
                $this->logger->info('ApiModelRegister', [
                    'key' => $modelEndpointId,
                    'model' => $modelConfig->getModel(),
                    'label' => $modelConfig->getName(),
                    'implementation' => $modelConfig->getImplementation(),
                ]);
            } catch (Throwable $exception) {
                $this->logger->warning('ApiModelRegisterWarning', [
                    'key' => $modelEndpointId,
                    'model' => $modelConfig->getModel(),
                    'label' => $modelConfig->getName(),
                    'implementation' => $modelConfig->getImplementation(),
                    'error' => $exception->getMessage(),
                ]);
            }
        }
    }

    protected function loadFlowModels(): void
    {
        $query = new MagicFlowAIModelQuery();
        $query->setEnabled(true);
        $page = Page::createNoPage();
        $dataIsolation = FlowDataIsolation::create()->disabled();
        $list = di(MagicFlowAIModelDomainService::class)->queries($dataIsolation, $query, $page)['list'];
        foreach ($list as $modelEntity) {
            try {
                // 为了兼容历史数据，每个 flow_model_config 同时支持 model 和 model_name 的映射
                $this->addFlowModelConfig($modelEntity, $modelEntity->getModelName());
                $this->addFlowModelConfig($modelEntity, $modelEntity->getName());
                $this->logger->info('FlowModelRegister', [
                    'model_name' => $modelEntity->getModelName(),
                    'name' => $modelEntity->getName(),
                    'label' => $modelEntity->getLabel(),
                    'implementation' => $modelEntity->getImplementation(),
                    'display' => $modelEntity->isDisplay(),
                ]);
            } catch (Throwable $exception) {
                $this->logger->warning('FlowModelRegisterWarning', [
                    'model_name' => $modelEntity->getModelName(),
                    'name' => $modelEntity->getName(),
                    'label' => $modelEntity->getLabel(),
                    'implementation' => $modelEntity->getImplementation(),
                    'display' => $modelEntity->isDisplay(),
                    'error' => $exception->getMessage(),
                ]);
            }
        }
    }

    /**
     * @param string $key 为了兼容历史数据，每个 flow_model_config 同时支持 model 和 model_name 的映射
     */
    private function addFlowModelConfig(MagicFlowAIModelEntity $modelEntity, string $key): void
    {
        $name = strtolower($modelEntity->getName());
        $key = strtolower($key);
        $this->addModel($name, [
            'model' => $key,
            'implementation' => $modelEntity->getImplementation(),
            'config' => $modelEntity->getActualImplementationConfig(),
            'model_options' => [
                'chat' => ! $modelEntity->isSupportEmbedding(),
                'function_call' => true,
                'embedding' => $modelEntity->isSupportEmbedding(),
                'multi_modal' => $modelEntity->isSupportMultiModal(),
                'vector_size' => $modelEntity->getVectorSize(),
            ],
        ]);
        $this->addAttributes(
            key: $name,
            attributes: new OdinModelAttributes(
                key: $name,
                name: $name,
                label: $modelEntity->getLabel(),
                icon: $modelEntity->getIcon(),
                tags: $modelEntity->getTags(),
                createdAt: $modelEntity->getCreatedAt(),
                owner: 'MagicAI',
            )
        );
    }

    /**
     * 获取当前组织下指定类型的所有可用模型.
     * @param string $organizationCode 组织代码
     * @param string $type 模型类型(chat|embedding)
     * @return OdinModel[]
     */
    private function getModelsByType(string $organizationCode, string $type): array
    {
        $list = [];

        // 获取已持久化的配置
        $models = $this->getModels($type);
        foreach ($models as $name => $model) {
            // 统一转换为小写
            $key = strtolower($name);
            $list[$key] = new OdinModel(key: $key, model: $model, attributes: $this->attributes[$key]);
        }
        // 加载 admin 配置的所有模型
        $providerConfigs = di(ServiceProviderDomainService::class)->getActiveModelsByOrganizationCode($organizationCode, ServiceProviderCategory::LLM);
        foreach ($providerConfigs as $providerConfig) {
            if (! $providerConfig->isEnabled()) {
                continue;
            }
            foreach ($providerConfig->getModels() as $providerModel) {
                if (! $providerModel->isActive()) {
                    continue;
                }

                $model = $this->createModelByAdmin($providerConfig, $providerModel);
                if (! $model) {
                    continue;
                }
                $list[$model->getAttributes()->getKey()] = $model;
            }
        }

        return $list;
    }

    private function getByAdmin(string $model, ?string $orgCode = null): ?OdinModel
    {
        $serviceProviderDomainService = di(ServiceProviderDomainService::class);
        $providerModels = $serviceProviderDomainService->getOrganizationActiveModelsByIdOrType($model, $orgCode);
        if (empty($providerModels)) {
            return null;
        }
        // 获取第一个模型
        $providerModel = $providerModels[0];
        if (! $providerModel->isActive()) {
            ExceptionBuilder::throw(ServiceProviderErrorCode::ModelNotActive);
        }
        // 如果当前模型是官方模型，则使用官方服务商
        if ($providerModel->isOffice() && $providerModel->getModelParentId()) {
            $providerModel = $serviceProviderDomainService->getModelById((string) $providerModel->getModelParentId());
            if (! $providerModel->isActive()) {
                ExceptionBuilder::throw(ServiceProviderErrorCode::ModelNotActive);
            }
        }
        // providerConfig 提供 host和 api-key，providerModel 提供具体要使用的模型接入点
        $providerConfig = $serviceProviderDomainService->getServiceProviderConfigByServiceProviderModel($providerModel);
        if (! $providerConfig || ! $providerConfig->isActive()) {
            ExceptionBuilder::throw(ServiceProviderErrorCode::ServiceProviderNotActive);
        }
        return $this->createModelByAdmin($providerConfig, $providerModel);
    }

    private function createModelByAdmin(ServiceProviderConfigDTO|ServiceProviderConfigEntity $providerConfigEntity, ServiceProviderModelsDTO|ServiceProviderModelsEntity $providerModelsEntity): ?OdinModel
    {
        if ($providerConfigEntity instanceof ServiceProviderConfigEntity) {
            $serviceProviderCode = $providerConfigEntity->getProviderCode();
        } else {
            $serviceProviderCode = ServiceProviderCode::tryFrom($providerConfigEntity->getProviderCode());
        }

        $chat = false;
        $functionCall = false;
        $multiModal = false;
        $embedding = false;
        $vectorSize = 0;
        if ($providerModelsEntity->getModelType() === ModelType::LLM->value) {
            $chat = true;
            $functionCall = $providerModelsEntity->getConfig()->isSupportFunction();
            $multiModal = $providerModelsEntity->getConfig()->isSupportMultiModal();
        } elseif ($providerModelsEntity->getModelType() === ModelType::EMBEDDING->value) {
            $embedding = true;
            $vectorSize = $providerModelsEntity->getConfig()->getVectorSize();
        }

        // 服务商侧的接入点名称
        $endpointName = $providerModelsEntity->getModelVersion();
        $config = $providerConfigEntity->getConfig();
        $modelVersion = $providerModelsEntity->getModelVersion();
        // 模型列表接口，对外展示为模型的名称，如:gpt4o，而不是服务商侧的接入点名称：ep-volce-gpt4o
        $modelId = $providerModelsEntity->getModelId();

        if (! $serviceProviderCode) {
            return null;
        }
        // odin 内部统一使用小写，对外展示不变
        $modelIdKey = strtolower($modelId);
        $endpointName = strtolower($endpointName);
        return new OdinModel(
            key: $modelIdKey,// 用户侧只返回模型名称，不返回服务商侧的接入点名称
            model: $this->createModel($endpointName, [
                'model' => $endpointName,
                'implementation' => $serviceProviderCode->getImplementation(),
                'config' => $serviceProviderCode->getImplementationConfig($config, $modelVersion),
                'model_options' => [
                    'chat' => $chat,
                    'function_call' => $functionCall,
                    'embedding' => $embedding,
                    'multi_modal' => $multiModal,
                    'vector_size' => $vectorSize,
                ],
            ]),
            attributes: new OdinModelAttributes(
                key: $modelIdKey,
                name: $modelId, // 用户侧只返回模型名称，不返回服务商侧的接入点名称
                label: $providerModelsEntity->getName(),
                icon: $providerModelsEntity->getIcon(),
                tags: [['type' => 1, 'value' => $serviceProviderCode->value]],
                createdAt: new DateTime($providerModelsEntity->getCreatedAt()),
                owner: 'MagicAI',
            )
        );
    }

    private function addAttributes(string $key, OdinModelAttributes $attributes): void
    {
        $this->attributes[$key] = $attributes;
    }

    private function createModel(string $model, array $item): EmbeddingInterface|ModelInterface
    {
        $implementation = $item['implementation'] ?? '';
        if (! class_exists($implementation)) {
            throw new InvalidArgumentException(sprintf('Implementation %s is not defined.', $implementation));
        }

        // 获取全局模型配置和API配置
        $generalModelOptions = $this->config->get('odin.llm.general_model_options', []);
        $generalApiOptions = $this->config->get('odin.llm.general_api_options', []);

        // 全局配置可以被模型配置覆盖
        $modelOptionsArray = array_merge($generalModelOptions, $item['model_options'] ?? []);
        $apiOptionsArray = array_merge($generalApiOptions, $item['api_options'] ?? []);

        // 创建选项对象
        $modelOptions = new ModelOptions($modelOptionsArray);
        $apiOptions = new ApiOptions($apiOptionsArray);

        // 获取配置
        $config = $item['config'] ?? [];

        // 获取实际的端点名称，优先使用模型配置中的model字段
        $endpoint = empty($item['model']) ? $model : $item['model'];
        // 保存/查询时统一转小写
        $endpoint = strtolower($endpoint);
        // 使用ModelFactory创建模型实例
        return ModelFactory::create(
            $implementation,
            $endpoint,
            $config,
            $modelOptions,
            $apiOptions,
            $this->logger
        );
    }

    private function createProxy(string $model, ModelOptions $modelOptions, ApiOptions $apiOptions): MagicAILocalModel
    {
        // 使用ModelFactory创建模型实例
        $odinModel = ModelFactory::create(
            MagicAILocalModel::class,
            $model,
            [
                'vector_size' => $modelOptions->getVectorSize(),
            ],
            $modelOptions,
            $apiOptions,
            $this->logger
        );
        if (! $odinModel instanceof MagicAILocalModel) {
            throw new InvalidArgumentException(sprintf('Implementation %s is not defined.', MagicAILocalModel::class));
        }
        return $odinModel;
    }
}
