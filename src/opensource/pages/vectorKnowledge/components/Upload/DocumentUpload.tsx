import { message, Upload } from "antd"
import type { PropsWithChildren } from "react"
import { SUPPORTED_EMBED_FILE_TYPES, supportedFileTypes } from "../../constant"
import { useTranslation } from "react-i18next"
import { useMemoizedFn } from "ahooks"

interface DocumentUploadProps {
	children: React.ReactNode
	dragger?: boolean
	handleFileUpload: (file: File) => void
}

export default function DocumentUpload({
	children,
	handleFileUpload,
	dragger = true,
}: PropsWithChildren<DocumentUploadProps>) {
	const { t: flowT } = useTranslation("flow")

	/** 上传文件 - 预校验 */
	const beforeFileUpload = useMemoizedFn((file: File) => {
		const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""

		if (!supportedFileTypes.includes(fileExtension)) {
			message.error(flowT("knowledgeDatabase.unsupportedFileType", { type: fileExtension }))
			return false
		}

		// 验证文件大小
		const isLt15M = file.size / 1024 / 1024 < 15
		if (!isLt15M) {
			message.error(flowT("knowledgeDatabase.fileSizeLimit", { size: "15MB" }))
			return false
		}

		handleFileUpload(file)
		// 直接return flase，不进行组件上传，使用自定义上传
		return false
	})

	return (
		<>
			{dragger ? (
				<Upload.Dragger
					accept={SUPPORTED_EMBED_FILE_TYPES}
					multiple
					showUploadList={false}
					beforeUpload={beforeFileUpload}
				>
					{children}
				</Upload.Dragger>
			) : (
				<Upload
					accept={SUPPORTED_EMBED_FILE_TYPES}
					multiple
					showUploadList={false}
					beforeUpload={beforeFileUpload}
				>
					{children}
				</Upload>
			)}
		</>
	)
}
