import { useFlow } from "@/MagicFlow/context/FlowContext/useFlow"
import { useMemo } from "react"

export default function useMaterialPanel() {
	const { showMaterialPanel, setShowMaterialPanel } = useFlow()

	const stickyButtonStyle = useMemo(() => {
		return {
			top: "91px",
			left: showMaterialPanel ? "298px" : "4px",
		}
	}, [showMaterialPanel])

	return {
		show: showMaterialPanel,
		setShow: setShowMaterialPanel,
		stickyButtonStyle,
	}
}
