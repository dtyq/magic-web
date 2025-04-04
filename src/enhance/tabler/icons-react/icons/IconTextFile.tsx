import { memo } from "react"
import type { IconProps } from "@tabler/icons-react"

function IconTextFile({ size }: IconProps) {
	return (
		<svg viewBox="0 0 1024 1024" width={size} height={size}>
			<g fillRule="evenodd" fill="none">
				<path d="M0 0h24v24H0z" />
				<path
					fill="#FFC154"
					d="M15.763 0 23 7.237V22a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12.763Z"
				/>
				<path
					fill="#FFF"
					fillOpacity=".401"
					d="M17.763 7.237a2 2 0 0 1-2-2V0L23 7.237h-5.237Z"
				/>
				<path
					strokeWidth="1.5"
					strokeLinejoin="round"
					strokeLinecap="round"
					stroke="#FFF"
					d="m10.279 12.952 3.442 4.514m.039-4.459-3.52 4.453m7.35-4.248v4.254m-1.986-4.459h3.972m-13.166.205v4.254m-1.986-4.459h3.972"
				/>
			</g>
		</svg>
	)
}

export default memo(IconTextFile)
