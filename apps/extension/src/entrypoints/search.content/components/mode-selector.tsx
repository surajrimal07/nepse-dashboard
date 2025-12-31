import clsx from "clsx";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import type { modeType } from "@/types/search-type";
import { selectIsDark, selectMode, selectSetMode } from "../selectors";
import { useSearchState } from "../store";
import { options } from "../utils";

function getLabelTextClass(isDark: boolean) {
	return clsx(
		"text-sm select-none",
		isDark ? "text-zinc-200" : "text-slate-800",
	);
}

const getContainerClass = () => "flex w-full justify-center gap-10 pb-1";

const getLabelWrapperClass = () => "flex items-center gap-1.5 cursor-pointer";

function iconClass(isDark: boolean) {
	return cn("w-3 h-3", isDark ? "text-zinc-200" : "text-slate-800");
}

const getIconTextWrapperClass = () => "flex items-center gap-0.5";

export function ModeSelector() {
	const { isDark, mode, setMode } = useSearchState(
		useShallow((state) => ({
			isDark: selectIsDark(state),
			mode: selectMode(state),
			setMode: selectSetMode(state),
		})),
	);

	return (
		<div className={getContainerClass()}>
			{options.map((opt) => {
				const selected = mode === opt.value;
				const Icon = opt.icon;

				return (
					<label
						key={opt.value}
						htmlFor={opt.value}
						className={getLabelWrapperClass()}
					>
						<input
							type="radio"
							id={opt.value}
							name="mode"
							value={opt.value}
							checked={selected}
							onChange={(e) => setMode(e.target.value as modeType)}
							style={{ accentColor: "#71717a", cursor: "pointer" }}
						/>
						<div className={getIconTextWrapperClass()}>
							<Icon className={iconClass(isDark)} />
							<span className={getLabelTextClass(isDark)}>{opt.label}</span>
						</div>
					</label>
				);
			})}
		</div>
	);
}
