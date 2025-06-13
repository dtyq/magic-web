import { initMermaidDb } from "@/opensource/database/mermaid"
import type { MermaidDb } from "@/opensource/database/mermaid/types"
import { RenderResult } from "mermaid"

const MERMAID_ERROR_SVG = "<g></g></svg>"

class MermaidRenderService {
	cacheSvg: Map<string, { data: string; svg: string; png: string }> = new Map()
	db: MermaidDb

	constructor() {
		this.db = initMermaidDb()
		this.db.mermaid.toArray().then((res) => {
			this.cacheSvg = res.reduce((acc, cur) => {
				acc.set(cur.data, cur)
				return acc
			}, new Map<string, { data: string; svg: string; png: string }>())
		})
	}

	/**
	 * 判断svg是否生成失败
	 * @param svg svg
	 * @returns 是否生成失败
	 */
	isErrorSvg(svg: string) {
		return svg.includes(MERMAID_ERROR_SVG)
	}

	/**
	 * 缓存svg
	 * @param chart 图表
	 * @param svg svg
	 */
	cache(chart: string, svg: RenderResult) {
		// 如果缓存中存在且svg相同，则不缓存
		if (this.cacheSvg.get(chart) && this.cacheSvg.get(chart)?.svg === svg.svg) {
			return this.cacheSvg.get(chart)
		}

		// 匹配到<g></g>标签，则认为没有渲染成功
		if (this.isErrorSvg(svg.svg)) {
			return undefined
		}

		const result = {
			data: chart,
			svg: svg.svg,
			diagramType: svg.diagramType,
			png: "",
		}

		this.cacheSvg.set(chart, result)

		this.db.mermaid.put(result).catch((err) => {
			console.error("缓存失败", err)
		})

		return result
	}

	/**
	 * 获取缓存
	 * @param chart 图表
	 * @returns 缓存
	 */
	async getCache(chart: string): Promise<{ data: string; svg: string; png: string } | undefined> {
		if (this.cacheSvg.get(chart)) {
			return this.cacheSvg.get(chart)
		}
		const res = await this.db.mermaid.where("data").equals(chart).first()
		if (res) {
			this.cacheSvg.set(chart, res)
			return res
		}
		return undefined
	}

	/**
	 * 修复mermaid数据
	 * @description 修复mermaid数据中的中文符号，将中文符号转换为英文符号
	 * @param data 数据
	 * @returns 修复后的数据
	 */
	fix(data: string | undefined): string {
		if (!data) return ""

		// Define Chinese to English punctuation mapping
		const punctuationMap: Record<string, string> = {
			"，": ", ",
			"。": ".",
			"：": ": ",
			"；": "; ",
			"！": "! ",
			"？": "? ",
			"、": " ",
			"（": " (",
			"）": ") ",
			"“": '"',
			"”": '"',
			"【": " [",
			"】": "] ",
			"°": "度",
			"¥": "元",
			"~": "~",
			"-": "-",
		}

		let result = data

		// Replace Chinese punctuation with English punctuation
		for (const [chinese, english] of Object.entries(punctuationMap)) {
			result = result.replace(new RegExp(chinese, "g"), english)
		}

		return result
	}
}

export default new MermaidRenderService()
