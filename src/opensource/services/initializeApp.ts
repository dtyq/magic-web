import { type Container, ServiceContainer } from "@/opensource/services/ServiceContainer"
import { UserService } from "@/opensource/services/user/UserService"
import * as apis from "@/apis"
import { LoginService } from "@/opensource/services/user/LoginService"
import { ConfigService } from "@/opensource/services/config/ConfigService"
import { initialApi } from "@/apis/clients/interceptor"

export function initializeApp() {
	const container = new ServiceContainer()

	// 将 API 初始化延迟到实际创建服务时进行
	container.registerFactory<UserService>(
		"userService",
		(c: Container) => new UserService(apis, c),
	)

	container.registerFactory<LoginService>(
		"loginService",
		(c: Container) => new LoginService(apis, c),
	)

	container.registerFactory<ConfigService>("configService", () => new ConfigService(apis))

	// 获取服务实例 - 容器内部会处理异步工厂的情况
	const userService = container.get<UserService>("userService")
	const loginService = container.get<LoginService>("loginService")
	const configService = container.get<ConfigService>("configService")

	initialApi(container)

	// 返回可供应用使用的服务实例
	return {
		userService,
		loginService,
		configService,
	}
}
