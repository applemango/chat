import ChatMessageImage from "./chatMessageImage";

const ChatInputFile = ({
    path,
    extension
}: {
    path: string
    extension: string
}) => {
    return <div>
        { ["png","jpg","jpeg"].indexOf(extension) + 1 && <div style={{maxHeight: 250,overflow: "hidden",marginBottom: 10}}>
                <ChatMessageImage path={path} />
            </div>}
    </div>
}
export default ChatInputFile;