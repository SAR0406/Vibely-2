import { ChatClient } from "./chat-client"
import { cookies, headers } from "next/headers"

export default async function ChatPage() {
    const cookieStore = await cookies()
    const layout = cookieStore.get("react-resizable-panels:layout:chat")
    const collapsed = cookieStore.get("react-resizable-panels:collapsed:chat")

    const defaultLayout = layout ? JSON.parse(layout.value) : undefined
    const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

    const headersList = await headers()
    const userAgent = headersList.get("user-agent") || ""
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)

    return (
        <ChatClient
            defaultLayout={defaultLayout}
            isMobile={isMobile}
        />
    )
}
