import { useState } from "react";
import { toast } from "sonner";

export interface UseClipboardOptions {
	/** Time in ms after which the copied state will reset, `2000` by default */
	timeout?: number;
	/** Name of the object being copied (e.g., 'Screenshot', 'Link', 'Image') */
	objectName?: string;
}

export interface UseClipboardReturnValue {
	/** Function to copy text to clipboard */
	copy: (value: string) => void;

	/** Function to copy blob to clipboard */
	copyBlob: (blob: Blob) => void;

	/** Function to reset copied state and error */
	reset: () => void;

	/** Error if copying failed */
	error: Error | null;

	/** Boolean indicating if the value was copied successfully */
	copied: boolean;
}

export function useClipboard(
	options: UseClipboardOptions = {
		timeout: 2000,
		objectName: "Content",
	},
): UseClipboardReturnValue {
	const [error, setError] = useState<Error | null>(null);
	const [copied, setCopied] = useState(false);
	const [copyTimeout, setCopyTimeout] = useState<number | null>(null);

	const handleCopyResult = (value: boolean) => {
		window.clearTimeout(copyTimeout!);
		setCopyTimeout(window.setTimeout(() => setCopied(false), options.timeout));
		setCopied(value);

		toast.success(`${options.objectName} copied to clipboard`);
	};

	const handleCopyError = (err: Error) => {
		setError(err);
		toast.error(`Error: ${err.message}`);
	};

	const copy = (value: string) => {
		if ("clipboard" in navigator) {
			setError(null);
			navigator.clipboard
				.writeText(value)
				.then(() => handleCopyResult(true))
				.catch((err) => handleCopyError(err));
		} else {
			const error = new Error(
				"useClipboard: navigator.clipboard is not supported",
			);
			handleCopyError(error);
		}
	};

	const copyBlob = async (blob: Blob) => {
		if ("clipboard" in navigator) {
			try {
				setError(null);
				await navigator.clipboard.write([
					new ClipboardItem({
						[blob.type]: blob,
					}),
				]);
				handleCopyResult(true);
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				handleCopyError(error);
			}
		} else {
			const error = new Error(
				"useClipboard: navigator.clipboard is not supported",
			);
			handleCopyError(error);
		}
	};

	const reset = () => {
		setCopied(false);
		setError(null);
		window.clearTimeout(copyTimeout!);
	};

	return { copy, copyBlob, reset, error, copied };
}
