import type { MagicButtonProps } from "@/opensource/components/base/MagicButton"
import MagicButton from "@/opensource/components/base/MagicButton"
import MagicIcon from "@/opensource/components/base/MagicIcon"
import UploadAction from "@/opensource/components/base/UploadAction"
import type { IMStyle } from "@/opensource/providers/AppearanceProvider/context"
import { IconFileUpload } from "@tabler/icons-react"
import { useMemoizedFn } from "ahooks"
import { memo } from "react"

interface UploadButtonProps extends MagicButtonProps {
	loading?: boolean
	icon?: React.ReactNode
	imStyle?: IMStyle
	onFileChange?: (files: FileList) => void
	multiple?: boolean
}

const UploadButton = memo(
	({ icon, onFileChange, multiple = true, children, ...props }: UploadButtonProps) => {
		const UploadHandler = useMemoizedFn((onUpload) => {
			return (
				<MagicButton
					type="text"
					onClick={onUpload}
					icon={
						icon || (
							<MagicIcon color="currentColor" size={20} component={IconFileUpload} />
						)
					}
					{...props}
				>
					{children}
				</MagicButton>
			)
		})

		return (
			<UploadAction handler={UploadHandler} onFileChange={onFileChange} multiple={multiple} />
		)
	},
)

export default UploadButton
