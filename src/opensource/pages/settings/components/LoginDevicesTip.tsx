import { Flex } from "antd"
import { useTheme, useThemeMode } from "antd-style"
import { useTranslation } from "react-i18next"
import { IconShieldLockFilled } from "@tabler/icons-react"
import MagicIcon from "@/opensource/components/base/MagicIcon"

export default function LoginDevicesTip() {
	const { t } = useTranslation("interface")
	const { isDarkMode } = useThemeMode()

	const { magicColorScales, magicColorUsages } = useTheme()

	return (
		<Flex
			align="center"
			gap={4}
			style={{
				padding: "10px 20px",
				flex: 1,
				backgroundColor: isDarkMode ? magicColorUsages.black : magicColorScales.green[0],
			}}
		>
			<MagicIcon component={IconShieldLockFilled} color={magicColorScales.green[5]} size={18} />
			<span>{t("setting.tip.loginDevicesTip")}</span>
		</Flex>
	)
}
