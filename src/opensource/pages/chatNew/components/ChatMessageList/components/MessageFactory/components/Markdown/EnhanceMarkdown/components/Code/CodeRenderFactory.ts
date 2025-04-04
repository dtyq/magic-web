import CodeComponents from "./config/CodeComponents"
import { CodeLanguage } from "./const"
import { CodeRenderComponent, CodeRenderProps } from "./types"
import { LazyExoticComponent, ComponentType, lazy } from "react"

class CodeRenderFactory {
	// 组件缓存，优先读取缓存
	private static componentCache = new Map<
		string,
		LazyExoticComponent<ComponentType<CodeRenderProps>>
	>()

	private static getFallbackComponent(): LazyExoticComponent<ComponentType<CodeRenderProps>> {
		return lazy(() => import("./components/Fallback"))
	}

	/**
	 * 获取行内代码组件
	 * @returns 行内代码组件
	 */
	static getInlineComponent(): LazyExoticComponent<ComponentType<CodeRenderProps>> {
		return lazy(() => import("./components/InlineCode"))
	}

	/**
	 * 注册组件
	 * @param lang 语言
	 * @param componentConfig 组件配置
	 */
	static registerComponent(lang: CodeLanguage, componentConfig: CodeRenderComponent) {
		CodeComponents[lang] = componentConfig
	}

	/**
	 * 获取组件
	 * @param type 组件类型
	 * @returns 组件
	 */
	static getComponent(type: CodeLanguage): LazyExoticComponent<ComponentType<CodeRenderProps>> {
		// 加载并返回组件
		const codeComponent = CodeComponents[type]

		// 检查缓存
		if (codeComponent && this.componentCache.has(codeComponent.componentType)) {
			return this.componentCache.get(codeComponent.componentType)!
		}

		// 没有加载器
		if (!codeComponent?.loader) {
			return this.getFallbackComponent()
		}

		// 创建 lazy 组件
		const LazyComponent = lazy(() =>
			codeComponent.loader().then((module) => ({
				default: module.default as ComponentType<CodeRenderProps>,
			})),
		)
		this.componentCache.set(codeComponent.componentType, LazyComponent)
		return LazyComponent
	}

	/**
	 * 清除缓存
	 * @param usedTypes 使用过的类型
	 */
	static cleanCache(usedTypes: string[]) {
		Array.from(this.componentCache.keys()).forEach((type) => {
			if (!usedTypes.includes(type)) {
				this.componentCache.delete(type)
			}
		})
	}
}

export default CodeRenderFactory
