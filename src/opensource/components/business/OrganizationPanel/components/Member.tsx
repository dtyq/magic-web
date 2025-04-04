import type { HTMLAttributes, ReactNode } from "react"
import { memo } from "react"
import type { StructureUserItem } from "@/types/organization"
import MagicAvatar from "@/opensource/components/base/MagicAvatar"
import { createStyles } from "antd-style"
import { Flex } from "antd"

import MagicLogo from "@/opensource/components/MagicLogo"
import { LogoType } from "@/opensource/components/MagicLogo/LogoType"

interface MemberProps extends HTMLAttributes<HTMLDivElement> {
	data: StructureUserItem
	extra?: (node: StructureUserItem) => ReactNode
}

const useStyles = createStyles(({ css, isDarkMode, token }) => {
	return {
		container: css`
			padding: 10px;
			cursor: pointer;
			border-radius: 8px;
			width: 100%;
			&:hover {
				background-color: ${isDarkMode
					? token.magicColorScales.grey[1]
					: token.magicColorScales.grey[0]};
			}
		`,
		extra: {},
		name: css`
			overflow: hidden;
			color: ${isDarkMode ? token.magicColorScales.grey[8] : token.magicColorUsages.text[1]};
			text-overflow: ellipsis;

			font-size: 14px;
			font-weight: 400;
			line-height: 20px;
		`,
		title: css`
			overflow: hidden;
			color: ${isDarkMode ? token.magicColorScales.grey[5] : token.magicColorUsages.text[2]};
			text-overflow: ellipsis;

			font-size: 12px;
			font-weight: 400;
			line-height: 16px;
		`,
	}
})

const Member = memo(({ extra, data: item, ...props }: MemberProps) => {
	const { styles } = useStyles()

	return (
		<Flex align="center" justify="space-between" className={styles.container} {...props}>
			<Flex gap={8} align="center">
				<MagicAvatar src={(item as StructureUserItem).avatar_url} size={32}>
					{item.real_name?.length > 0 ? (
						item.real_name
					) : (
						<MagicLogo type={LogoType.ICON} />
					)}
				</MagicAvatar>
				<Flex vertical>
					<span className={styles.name}>{item.real_name}</span>
					{item.job_title ? <span className={styles.title}>{item.job_title}</span> : null}
				</Flex>
			</Flex>
			<div className={styles.extra}>{extra ? extra(item) : null}</div>
		</Flex>
	)
})

export default Member
