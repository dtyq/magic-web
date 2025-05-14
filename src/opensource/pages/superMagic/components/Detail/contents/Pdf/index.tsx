import PDFIcon from "@/opensource/pages/superMagic/assets/file_icon/pdf.svg"
import CommonHeader from "@/opensource/pages/superMagic/components/Detail/components/CommonHeader"
import { useRef } from "react"
import { useStyles } from "./style"
import CommonFooter from "../../components/CommonFooter"
import { useFileUrl } from "@/opensource/pages/superMagic/hooks/useFileUrl"
export default function PDFViewer(props: any) {
	const { styles } = useStyles()
	const {
		type,
		currentIndex,
		onPrevious,
		onNext,
		onFullscreen,
		onDownload,
		totalFiles,
		hasUserSelectDetail,
		setUserSelectDetail,
		userSelectDetail,
		isFromNode,
		onClose,
		isFullscreen,
		data,
	} = props
	const { file_name, file_id } = data
	const { fileUrl: file_url } = useFileUrl({ file_id })
	const containerRef = useRef<HTMLDivElement>(null)

	return (
		<div ref={containerRef} className={styles.pdfViewer}>
			<CommonHeader
				title={file_name}
				icon={<img src={PDFIcon} alt="" />}
				type={type}
				currentAttachmentIndex={currentIndex}
				totalFiles={totalFiles}
				onPrevious={onPrevious}
				onNext={onNext}
				onFullscreen={onFullscreen}
				onDownload={onDownload}
				hasUserSelectDetail={hasUserSelectDetail}
				setUserSelectDetail={setUserSelectDetail}
				isFromNode={isFromNode}
				onClose={onClose}
				isFullscreen={isFullscreen}
			/>
			<div className={styles.pdfContainer}>
				<iframe
					src={`${file_url}#view=FitH&zoom=page-fit`}
					width="100%"
					height="100%"
					title={file_name}
					frameBorder="0"
					scrolling="auto"
					style={{
						border: "none",
						maxWidth: "100%",
						overflow: "hidden",
					}}
				></iframe>
			</div>
			{isFromNode && (
				<CommonFooter
					setUserSelectDetail={setUserSelectDetail}
					userSelectDetail={userSelectDetail}
					onClose={onClose}
				/>
			)}
		</div>
	)
}
