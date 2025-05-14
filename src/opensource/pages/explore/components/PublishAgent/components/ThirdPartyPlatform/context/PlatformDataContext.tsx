import type { Bot } from "@/types/bot"
import type { Dispatch, SetStateAction } from "react"
import { createContext, useContext, useMemo } from "react"

type PlatformDataType = {
	platformData: Bot.ThirdPartyPlatform
	setPlatformData: Dispatch<SetStateAction<Bot.ThirdPartyPlatform>>
	resetPlatformData: () => void
	mode: string
	updateRow: (index: number, newData: Bot.ThirdPartyPlatform) => void
	editIndex: number
}

const PlatformDataContext = createContext({} as PlatformDataType)

export const PlatformDataProvider = ({
	platformData,
	setPlatformData,
	resetPlatformData,
	mode,
	updateRow,
	editIndex,
	children,
}: React.PropsWithChildren<PlatformDataType>) => {
	const value = useMemo(() => {
		return { platformData, setPlatformData, resetPlatformData, mode, updateRow, editIndex }
	}, [platformData, setPlatformData, resetPlatformData, mode, updateRow, editIndex])

	return <PlatformDataContext.Provider value={value}>{children}</PlatformDataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePlatformData = () => {
	return useContext(PlatformDataContext)
}
