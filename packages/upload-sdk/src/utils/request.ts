/**
 * @file 全局请求
 */

import { HttpException, HttpExceptionCode } from "../Exception/HttpException"
import type { TaskId } from "../types"
import type { RequestTask, UploadRequestConfig } from "../types/request"
import { isObject } from "./checkDataFormat"
import { formatHeaders } from "../modules/TOS/utils"

// 维护一个请求队列
let requestTasks: RequestTask[] = []

/**
 * XMLHttpRequest对象兼容处理
 */
function createXHR() {
	if (typeof XMLHttpRequest !== "undefined") {
		// Firefox,Opera,Safari,Chrome
		return new XMLHttpRequest()
	}
	throw new HttpException(HttpExceptionCode.REQUEST_NO_XHR_OBJ_AVAILABLE)
}
/**
 * @description: 终止文件上传
 * @param {TaskId} taskId 任务ID
 */
export function cancelRequest(taskId: TaskId): void {
	requestTasks.forEach((task) => {
		if (task.taskId === taskId) {
			task.makeCancel()
		}
	})
}

/**
 * @description: 终止文件上传
 * @param {TaskId} taskId 任务ID
 */
export function pauseRequest(taskId: TaskId): void {
	requestTasks.forEach((task) => {
		if (task.taskId === taskId) {
			task.makePause()
		}
	})
}

/**
 * @description: XML =>>> Object
 * @param {XMLDocument} xml
 * @return {Object} convertedObj 转换Object
 */
function parseXML(xml: XMLDocument | null): Record<string, string | object> | {} {
	// output
	let convertedObj: Record<string, object | string> = {}
	if (xml?.children && xml.children.length !== 0) {
		Object.values(xml.children).forEach((childNode: any) => {
			convertedObj = {
				...convertedObj,
				[childNode.nodeName]: parseXML(childNode),
			}
		})
	} else {
		return xml?.textContent ? xml.textContent : {}
	}
	return convertedObj
}

/**
 * 解析header字符串为对象
 * @param str
 */
function parseHeaderString(str: string) {
	return str.split("\r\n").reduce((obj, header) => {
		let tempObj = { ...obj }
		if (header !== "" && header.split(":").length > 0) {
			const [key, value] = header.split(":")
			tempObj = {
				...tempObj,
				[key]: value.replace(" ", ""),
			}
		}
		return tempObj
	}, {})
}

/**
 * @description: 请求结束（无论成功或者失败）
 * @param {TaskId} taskId 任务ID
 */
export function completeRequest(taskId: TaskId | undefined): void {
	if (taskId === undefined) return

	requestTasks = requestTasks.filter((task) => task.taskId !== taskId)
}

/**
 * 判断是否是JSON响应
 * @param req
 */
function isJSONResponse(req: XMLHttpRequest) {
	return req.responseType === "json" && typeof req.response === "string"
}

/**
 * 补充headers对象到响应对象中
 * @param result
 * @param responseHeaders
 */
function addHeadersToResponse<T extends Record<string, any>, H extends Record<string, string>>(
	result: T,
	responseHeaders: H,
): T & { headers: H } {
	return {
		...result,
		headers: responseHeaders,
	}
}

/**
 * 封装XHR请求方法
 * @param {UploadRequestConfig} uploadRequestConfig
 * @return {Promise<Result>}
 */
export function request<T>(uploadRequestConfig: UploadRequestConfig): Promise<T> {
	const {
		method,
		url,
		data,
		query,
		headers,
		success,
		fail,
		taskId,
		onProgress,
		xmlResponse,
		withoutWrapper,
	} = uploadRequestConfig

	return new Promise((resolve, reject) => {
		// 创建一个请求
		const req = createXHR()
		// 取消状态
		let isCancel: boolean = false

		// 暂停状态
		let isPause: boolean = false

		req.responseType = xmlResponse ? "document" : "json"

		// 监听上传文件开始
		req.upload.onloadstart = () => {
			if (taskId) {
				requestTasks.push({
					taskId,
					makeCancel: () => {
						isCancel = true
						req.abort()
					},
					makePause: () => {
						isPause = true
						req.abort()
					},
				})
			}
		}

		// 监听上传文件进度事件
		req.upload.onprogress = (evt: any) => {
			if (onProgress) onProgress((evt.loaded / evt.total) * 100, evt.loaded, evt.total, null)
		}

		// 处理查询参数
		let handledUrl = url
		if (query) {
			const queryString = Object.entries(query)
				.map(([key, value]) => {
					if (value) {
						return `${key}=${value}`
					}
					return key
				})
				.join("&")

			if (queryString) {
				handledUrl += `?${queryString}`
			}
		}

		// 设置请求方法、请求地址、是否异步
		req.open(method.toUpperCase(), handledUrl, true)

		// 设置请求头
		req.setRequestHeader("language", "zh_CN")

		if (headers && Object.keys(headers).length > 0) {
			const handledHeaders = formatHeaders(headers)
			Object.keys(handledHeaders).forEach((key) => {
				req.setRequestHeader(key, headers[key])
			})
		}

		// 发送请求
		req.send(data as XMLHttpRequestBodyInit | null)

		// 接收响应
		req.onreadystatechange = () => {
			if (req.readyState !== 4) {
				return
			}
			// 判断响应状态
			if (/^2\d{2}/.test(String(req.status))) {
				// 请求成功
				let result = isJSONResponse(req) ? JSON.parse(req.response) : req.response
				const responseHeaders: Record<string, string> = {
					...parseHeaderString(req.getAllResponseHeaders()),
				}

				// aliyun initMultipleUpload
				if (xmlResponse) {
					result = {
						data: parseXML(req.responseXML),
					}
				}
				// tos post
				if (withoutWrapper || !isObject(result)) {
					result = {
						data: result,
					}
				}
				result = addHeadersToResponse(result, responseHeaders)

				resolve(result)
				if (success && typeof success === "function") {
					success(result)
				}
			} else {
				// 请求失败
				if (fail && typeof fail === "function") {
					fail(req.status, reject)
				}
				if (isCancel) {
					reject(new HttpException(HttpExceptionCode.REQUEST_IS_CANCEL))
				} else if (isPause) {
					reject(new HttpException(HttpExceptionCode.REQUEST_IS_PAUSE))
				}
				reject(
					new HttpException(
						HttpExceptionCode.REQUEST_FAILED_WITH_STATUS_CODE,
						req.status,
					),
				)
			}
		}
	})
}
