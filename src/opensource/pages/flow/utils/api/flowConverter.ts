//@ts-nocheck
/**
 * Flow转换器API
 * 提供YAML和JSON之间转换的API
 */

import { message } from "antd"
import { FlowConverter } from "../flowConverter"

/**
 * 转换YAML到JSON
 * @param yamlString YAML字符串
 * @returns JSON对象或null
 */
export const convertYAMLToJSON = (yamlString: string) => {
	try {
		return FlowConverter.yamlToJson(yamlString)
	} catch (error) {
		message.error(`YAML转JSON失败: ${error.message}`)
		console.error("YAML转JSON失败:", error)
		return null
	}
}

/**
 * 转换JSON到YAML
 * @param jsonObj JSON对象
 * @returns YAML字符串或null
 */
export const convertJSONToYAML = (jsonObj: any) => {
	try {
		return FlowConverter.jsonToYamlString(jsonObj)
	} catch (error) {
		message.error(`JSON转YAML失败: ${error.message}`)
		console.error("JSON转YAML失败:", error)
		return null
	}
}

/**
 * 转换JSON字符串到YAML
 * @param jsonString JSON字符串
 * @returns YAML字符串或null
 */
export const convertJSONStringToYAML = (jsonString: string) => {
	try {
		return FlowConverter.jsonStringToYamlString(jsonString)
	} catch (error) {
		message.error(`JSON字符串转YAML失败: ${error.message}`)
		console.error("JSON字符串转YAML失败:", error)
		return null
	}
}

/**
 * 转换YAML到JSON字符串
 * @param yamlString YAML字符串
 * @returns JSON字符串或null
 */
export const convertYAMLToJSONString = (yamlString: string) => {
	try {
		return FlowConverter.yamlToJsonString(yamlString)
	} catch (error) {
		message.error(`YAML转JSON字符串失败: ${error.message}`)
		console.error("YAML转JSON字符串失败:", error)
		return null
	}
}

export default {
	convertYAMLToJSON,
	convertJSONToYAML,
	convertJSONStringToYAML,
	convertYAMLToJSONString,
}
