import ImageWrapper from "@/opensource/components/base/MagicImagePreview/components/ImageWrapper"
import { Flex } from "antd"
import type { HTMLAttributes } from "react"
import { memo, useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"
import AiGradientBgAnimation from "@/opensource/components/animations/AiGradientBgAnimation"
import MagicButton from "@/opensource/components/base/MagicButton"
import { IconBadgeHd, IconMessageForward } from "@tabler/icons-react"
import type { AIImagesContentItem, HDImageDataType } from "@/types/chat/conversation_message"
import { AIImagesDataType } from "@/types/chat/conversation_message"
import { useBoolean, useMemoizedFn, useSize } from "ahooks"
import { useConversationMessage } from "@/opensource/pages/chatNew/components/ChatMessageList/components/MessageItem/components/ConversationMessageProvider/hooks"
import TextAnimation from "@/opensource/components/animations/TextAnimation"
import SearchAnimation from "@/opensource/components/animations/SearchAnimation"
import { useStyles } from "./styles"
import type { ResponseData } from "../index"

interface AiImageProps extends HTMLAttributes<HTMLImageElement> {
	type?: AIImagesDataType | HDImageDataType
	alt?: string
	fileId?: string
	oldFileId?: string
	item?: ResponseData
	onEdit?: (item?: AIImagesContentItem) => void
	onToHD?: (file_id?: string) => void
}

const AiImage = memo(({ type, className, item, onEdit, onToHD, ...rest }: AiImageProps) => {
	const { styles, cx } = useStyles()
	const { t } = useTranslation("interface")

	const imageRef = useRef<HTMLDivElement>(null)
	const imageSize = useSize(imageRef)

	const animationBgRef = useRef<HTMLDivElement>(null)
	const animationBgSize = useSize(animationBgRef)

	const { messageId } = useConversationMessage()
	const [show, { setTrue, setFalse }] = useBoolean(false)
	const [imgLoaded, { setTrue: setImgLoadedTrue }] = useBoolean(false)

	const onLoad = useMemoizedFn(() => {
		setImgLoadedTrue()
	})

	const right = useMemo(() => (imageSize && imageSize?.width > 150 ? 20 : "auto"), [imageSize])
	const showText = useMemo(() => imageSize && imageSize?.width >= 150, [imageSize])

	const hdText = useMemo(
		() =>
			item?.old_file_id
				? t("chat.imagePreview.hightImageConverted")
				: t("chat.imagePreview.highDefinition"),
		[item?.old_file_id, t],
	)

	const maxPx = useMemo(() => {
		if (!animationBgSize) return 900
		return Math.max(animationBgSize.width, animationBgSize.height)
	}, [animationBgSize])

	const Loader = useMemoizedFn((cls?: string) => {
		return (
			<Flex ref={animationBgRef} className={cx(styles.container, cls)}>
				<div style={{ width: maxPx, height: maxPx }}>
					<AiGradientBgAnimation style={{ width: maxPx, height: maxPx }} />
					<Flex
						vertical
						className={styles.animationBg}
						justify="center"
						align="center"
						gap={10}
					>
						<SearchAnimation size={20} />
						<TextAnimation dotwaveAnimation gradientAnimation className={styles.text}>
							{t("chat.aiImage.Generating")}
						</TextAnimation>
					</Flex>
				</div>
			</Flex>
		)
	})

	if (type !== AIImagesDataType.GenerateComplete) {
		return Loader(className)
	}

	return (
		<Flex
			ref={imageRef}
			vertical
			align="center"
			className={cx(styles.container, className)}
			onMouseEnter={setTrue}
			onMouseLeave={setFalse}
		>
			<ImageWrapper
				containerClassName={styles.container}
				// loader={Loader}
				className={cx(styles.image)}
				messageId={messageId}
				useHDImage
				onLoad={onLoad}
				{...rest}
			/>
			{show && imgLoaded && (
				<Flex gap={4} className={styles.buttonGroup} style={{ right }}>
					<MagicButton className={styles.button} onClick={() => onEdit?.(item)}>
						<Flex gap={2} align="center" justify="center">
							<IconMessageForward size={20} />
							{showText && t("button.edit")}
						</Flex>
					</MagicButton>
					<MagicButton
						className={styles.button}
						onClick={() => onToHD?.(item?.file_id)}
						disabled={!!item?.old_file_id}
					>
						<Flex gap={2} align="center" justify="center">
							<IconBadgeHd size={20} />
							{showText && hdText}
						</Flex>
					</MagicButton>
				</Flex>
			)}
		</Flex>
	)
})

export default AiImage
