import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import type { modeType } from "@/types/search-type";
import { selectMode, selectSetMode } from "../selectors";
import { useSearchState } from "../store";
import { options } from "../utils";

const getLabelTextClass = () => "text-sm select-none text-zinc-200";

const getContainerClass = () => "flex w-full justify-center gap-10 pb-1";

const getLabelWrapperClass = () => "flex items-center gap-1.5 cursor-pointer";

const iconClass = () => cn("w-3 h-3", "text-zinc-200");

const getIconTextWrapperClass = () => "flex items-center gap-0.5";

export function ModeSelector() {
	const { mode, setMode } = useSearchState(
		useShallow((state) => ({
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
							<Icon className={iconClass()} />
							<span className={getLabelTextClass()}>{opt.label}</span>
						</div>
					</label>
				);
			})}
		</div>
	);
}
