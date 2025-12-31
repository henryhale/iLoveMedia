export function downloadFile(data: Blob | string | null, filename: string) {
	if (!data) return
	const a = document.createElement("a")
	a.download = filename

	if (data instanceof Blob) {
		a.href = URL.createObjectURL(data)
	} else {
		a.href = data
	}
	a.click()

	if (data instanceof Blob) URL.revokeObjectURL(a.href)
}

export function formatSize(bytes: number) {
	if (bytes === 0) return "0 Bytes"
	const k = 1024
	const sizes = ["Bytes", "KB", "MB", "GB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
