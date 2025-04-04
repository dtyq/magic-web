import { memo, useEffect, useMemo, useRef, useState } from "react"
import mermaid from "mermaid"
import { useTranslation } from "react-i18next"
import { useThemeMode } from "antd-style"
import { nanoid } from "nanoid"
import { Flex } from "antd"
import { useStyles } from "./styles"
import { MagicMermaidType } from "./constants"
import type { MagicMermaidProps } from "./types"
import MagicSegmented from "@/opensource/components/base/MagicSegmented"
import MagicCode from "@/opensource/components/base/MagicCode"

const MagicMermaid = memo(function MagicMermaid({
	data,
	className,
	onClick,
	allowShowCode = true,
	copyText,
	...props
}: MagicMermaidProps) {
	const mermaidRef = useRef<HTMLDivElement>(null)
	const { t } = useTranslation("interface")

	const options = useMemo(
		() => [
			{
				label: t("chat.markdown.graph"),
				value: MagicMermaidType.Mermaid,
			},
			{
				label: t("chat.markdown.raw"),
				value: MagicMermaidType.Code,
			},
		],
		[t],
	)

	const [type, setType] = useState<MagicMermaidType>(options[0].value)
	const { styles, cx } = useStyles({ type })
	const { isDarkMode } = useThemeMode()
	const id = useRef(`mermaid_${nanoid()}`)

	const [isError, setIsError] = useState<string | null>(null)

	useEffect(() => {
		if (data) {
			mermaid.initialize({ startOnLoad: false, darkMode: isDarkMode })
			if (mermaidRef.current) {
				mermaidRef.current.innerHTML = data
			}

			mermaid
				.render(`${id.current}`, data)
				.then(({ svg }) => {
					if (mermaidRef.current) {
						mermaidRef.current.innerHTML = svg
						setIsError(null)
						setType(MagicMermaidType.Mermaid)
					}
				})
				.catch((err) => {
					setIsError(err.message)
					setType(MagicMermaidType.Code)
					console.error("Mermaid failed to initialize", err)
				})
		}
	}, [data, isDarkMode])

	return (
		<div
			className={cx(styles.container, className)}
			onClick={(e) => e.stopPropagation()}
			{...props}
		>
			{allowShowCode && (
				<Flex className={styles.segmented} gap={4}>
					<MagicSegmented value={type} onChange={setType} options={options} />
				</Flex>
			)}
			<div className={styles.mermaid}>
				{isError ? (
					<span className={styles.error}>{t("chat.mermaid.error")}</span>
				) : (
					<div
						ref={mermaidRef}
						className={cx(id.current, styles.mermaidInnerWrapper)}
						onClick={() => onClick?.(mermaidRef.current)}
					/>
				)}
			</div>
			<MagicCode className={styles.code} data={data} copyText={copyText} />
		</div>
	)
})

export default MagicMermaid
