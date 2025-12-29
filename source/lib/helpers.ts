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
