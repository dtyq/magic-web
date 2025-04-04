import ImageWrapper from "@/opensource/components/base/MagicImagePreview/components/ImageWrapper"
import MagicSpin from "@/opensource/components/base/MagicSpin"
import { useMessageRenderContext } from "@/opensource/components/business/MessageRenderProvider/hooks"
import { useConversationMessage } from "@/opensource/pages/chatNew/components/ChatMessageList/components/MessageItem/components/ConversationMessageProvider/hooks"
import { createStyles } from "antd-style"
import { isEmpty } from "lodash-es"
import { memo, useMemo } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { useTranslation } from "react-i18next"
import useSWRImmutable from "swr/immutable"
import ErrorContent from "../../../../../../ErrorContent"
import { CodeRenderProps } from "../../types"
import StreamingPlaceholder from "../../../StreamingPlaceholder"

interface OssFileProps extends CodeRenderProps {
	data?: string
}

const enum OssFileType {
	Image = "image",
	Video = "video",
	Svg = "svg",
}

const enum DataSource {
	Local = "local",
	Api = "api",
}

interface OssFileApiData {
	source: DataSource.Api
	api_endpoint: string
	name: string
	type: OssFileType.Image | OssFileType.Video
	oss_key: string
	request_body: unknown
}

interface OssFileLocalData {
	source: DataSource.Local
	type: OssFileType.Svg
	content: string
}

type OssFileData = OssFileApiData | OssFileLocalData

type OssFileRequestData = {
	code: number
	message: string
	data: {
		url: string
	}
}

const useStyles = createStyles(({ css }) => ({
	image: css`
		max-width: 100%;
	`,
}))

/**
 * 第三方平台静态资源获取
 * @param param0
 * @returns
 */
const OssFile = ({ data: value }: OssFileProps) => {
	const { messageId } = useConversationMessage()
	const { t } = useTranslation("interface")
	const { hiddenDetail } = useMessageRenderContext()
	const { styles } = useStyles()

	const { data, error } = useMemo(() => {
		try {
			return {
				data: JSON.parse(value as string) as OssFileData,
				error: false,
			}
		} catch (err) {
			console.error(err)
			return {
				data: undefined,
				error: err,
			}
		}
	}, [value])

	const {
		data: requestData,
		error: requestError,
		isLoading,
		mutate,
	} = useSWRImmutable(
		data && data.source === DataSource.Api ? data : false,
		(d: OssFileApiData) =>
			fetch(d?.api_endpoint, {
				method: "POST",
				headers: new Headers({
					"Content-Type": "application/json",
				}),
				body: JSON.stringify(d?.request_body),
			}).then((res) => res.json() as Promise<OssFileRequestData>),
	)

	if (hiddenDetail) {
		return t("chat.message.placeholder.image")
	}

	if (error || requestError) {
		return <ErrorContent />
	}

	switch (data?.type) {
		case OssFileType.Image:
			if (isEmpty(requestData?.data)) {
				return <p>{t("chat.message.markdown.image_is_not_exist")}</p>
			}
			return (
				<MagicSpin spinning={isLoading}>
					<ImageWrapper
						src={requestData?.data.url}
						messageId={messageId}
						alt={requestData?.data.url}
						className={styles.image}
						onError={() => {
							mutate()
						}}
						standalone
					/>
				</MagicSpin>
			)
		case OssFileType.Video:
			if (isEmpty(requestData?.data)) {
				return <p>{t("chat.message.markdown.image_is_not_exist")}</p>
			}
			return (
				<MagicSpin spinning={isLoading}>
					<video src={requestData?.data.url} controls>
						<track kind="captions" />
					</video>
				</MagicSpin>
			)
		case OssFileType.Svg:
			return (
				<ImageWrapper
					src={atob(data.content)}
					messageId={messageId}
					alt={data.content}
					className={styles.image}
					imgExtension="svg"
					onError={() => {
						mutate()
					}}
					standalone
				/>
			)
		default:
			return null
	}
}

const MemoOssFile = memo((props: OssFileProps) => {
	const { isStreaming } = props
	const { t } = useTranslation("interface")

	if (isStreaming) {
		return <StreamingPlaceholder tip={t("chat.oss_file.loading")} />
	}

	return (
		<ErrorBoundary
			fallbackRender={(error) => {
				console.error(error)
				return <ErrorContent />
			}}
		>
			<OssFile {...props} />
		</ErrorBoundary>
	)
})

export default MemoOssFile
