import { createStyles, keyframes } from "antd-style"

const gradientAnimation = keyframes`
  0% {
    background-position-x: 100%;
  }
  100% {
    background-position-x: 0%;
  }
`

export const useStyles = createStyles(() => ({
	loadingMessage: {
		display: "flex",
		alignItems: "center",
		gap: "4px",
		marginTop: "10px",
		marginLeft: "-7px",
	},
	loadingMessageText: {
		position: "relative",
		fontSize: "14px",
		fontStyle: "normal",
		fontWeight: 400,
		lineHeight: "20px",
		letterSpacing: ".25px",
		backgroundClip: "text",
		color: "transparent",
		backgroundSize: "200% 100%",
		animation: `${gradientAnimation} 1.2s linear infinite`,
		backgroundImage: "linear-gradient(90deg, #B5B5B5 35%, #060607 50%, #B5B5B5 65%)",
		backgroundPositionX: "34.1333%",
		backgroundPositionY: "50%",
	},
	loadingMessageIcon: {
		width: "24px",
		height: "24px",
	},
}))

export default useStyles
