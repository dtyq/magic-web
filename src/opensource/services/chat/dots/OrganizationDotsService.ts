/* eslint-disable class-methods-use-this */
import OrganizationDotsStore from "@/opensource/stores/chatNew/dots/OrganizationDotsStore"
import OrganizationDotsDbService from "./OrganizationDotsDbService"
import { bigNumCompare } from "@/utils/string"

/**
 * 组织新消息提示服务
 */
class OrganizationDotsService {
	/**
	 * 添加组织新消息提示
	 * @param organizationCode 组织编码
	 * @param count 数量
	 * @param seqId 序列号
	 */
	addOrganizationDot(organizationCode: string, seqId: string, count: number = 1) {
		console.log("添加组织新消息提示", organizationCode, seqId, count)

		if (
			bigNumCompare(OrganizationDotsStore.getOrganizationDotSeqId(organizationCode), seqId) >=
			0
		) {
			console.log(
				"addOrganizationDot",
				OrganizationDotsStore.getOrganizationDotSeqId(organizationCode),
				seqId,
			)
			return
		}
		OrganizationDotsStore.setOrganizationDots(
			organizationCode,
			OrganizationDotsStore.getOrganizationDots(organizationCode) + count,
		)
		OrganizationDotsStore.setOrganizationDotSeqId(organizationCode, seqId)
		const timer = setTimeout(() => {
			OrganizationDotsDbService.setPersistenceData(OrganizationDotsStore.dots)
			OrganizationDotsDbService.setDotSeqIdData(OrganizationDotsStore.dotSeqId)
			clearTimeout(timer)
		}, 0)
	}

	/**
	 * 减少组织新消息提示
	 * @param organizationCode 组织编码
	 */
	reduceOrganizationDot(organizationCode: string, count: number = 1) {
		OrganizationDotsStore.setOrganizationDots(
			organizationCode,
			Math.max(OrganizationDotsStore.getOrganizationDots(organizationCode) - count, 0),
		)
		setTimeout(() => {
			OrganizationDotsDbService.setPersistenceData(OrganizationDotsStore.dots)
		}, 0)
	}

	/**
	 * 获取组织新消息提示
	 * @param organizationCode 组织编码
	 * @returns 新消息提示
	 */
	getOrganizationDot(organizationCode: string) {
		return OrganizationDotsStore.getOrganizationDots(organizationCode)
	}

	/**
	 * 获取组织新消息提示序列号
	 * @param organizationCode 组织编码
	 * @returns 新消息提示序列号
	 */
	getOrganizationDotSeqId(organizationCode: string) {
		return OrganizationDotsStore.getOrganizationDotSeqId(organizationCode)
	}

	/**
	 * 清除组织新消息提示
	 * @param organizationCode 组织编码
	 */
	clearOrganizationDot(organizationCode: string) {
		OrganizationDotsStore.clearOrganizationDots(organizationCode)
		OrganizationDotsDbService.setPersistenceData(OrganizationDotsStore.dots)
	}

	/**
	 * 清除所有组织新消息提示
	 */
	clearAllOrganizationDots() {
		OrganizationDotsStore.clearAllOrganizationDots()
		OrganizationDotsDbService.setPersistenceData(OrganizationDotsStore.dots)
	}
}

export default new OrganizationDotsService()
