import MagicAvatar from "@/opensource/components/base/MagicAvatar"
import { useCurrentOrganization } from "@/opensource/models/user/hooks"

import { Popover } from "antd"
import type { ReactNode } from "react"
import { useState, memo } from "react"
import { useStyles } from "./styles"
import OrganizationList from "./OrganizationList"

interface OrganizationSwitchProps {
	className?: string
	showPopover?: boolean
	children?: ReactNode
}

const OrganizationSwitch = memo(
	({ className, showPopover = true, children }: OrganizationSwitchProps) => {
		const { styles, cx } = useStyles()

		const currentAccount = useCurrentOrganization()

		const [open, setOpen] = useState(false)

		const ChildrenContent = children ?? (
			<MagicAvatar
				src={currentAccount?.organization_logo?.[0]?.url}
				size={30}
				className={cx(className, styles.avatar)}
			>
				{currentAccount?.organization_name}
			</MagicAvatar>
		)

		if (!showPopover) {
			return ChildrenContent
		}

		return (
			<Popover
				overlayClassName={styles.popover}
				placement="rightBottom"
				open={open}
				onOpenChange={setOpen}
				arrow={false}
				trigger={["click"]}
				autoAdjustOverflow
				content={<OrganizationList onClose={() => setOpen(false)} />}
			>
				{ChildrenContent}
			</Popover>
		)
	},
)

export default OrganizationSwitch
