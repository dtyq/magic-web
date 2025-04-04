import { useClientDataSWR } from "@/utils/swr"
import type { User } from "@/types/user"
import { keyBy } from "lodash-es"
import { RequestUrl } from "@/opensource/apis/constant"
import { UserApi } from "@/opensource/apis"
import { useMemo } from "react"
import { useOrganization } from "./useOrganization"

/**
 * @description 获取当前账号所登录的设备
 */
export const useUserDevices = () => {
	return useClientDataSWR<User.UserDeviceInfo[]>(RequestUrl.getUserDevices, () =>
		UserApi.getUserDevices(),
	)
}

/**
 * @description 获取当前账号所处组织信息 Hook
 * @return {User.UserOrganization | undefined}
 */
export const useCurrentOrganization = (): User.UserOrganization | null => {
	const { organizations, organizationCode, magicOrganizationMap, teamshareOrganizationCode } =
		useOrganization()

	return useMemo(() => {
		// 获取组织映射
		const orgMap = keyBy(organizations, "organization_code")
		let org = null
		// 根据 magic 组织 Code 尝试获取组织
		if (organizationCode) {
			org =
				orgMap?.[magicOrganizationMap?.[organizationCode]?.third_platform_organization_code]
		}
		if (!org && teamshareOrganizationCode) {
			org = orgMap?.[teamshareOrganizationCode]
		}
		return org
	}, [organizations, organizationCode, magicOrganizationMap, teamshareOrganizationCode])
}

export * from "./useAccount"
export * from "./useOrganization"
export * from "./useAuthorization"
export * from "./useUserInfo"
