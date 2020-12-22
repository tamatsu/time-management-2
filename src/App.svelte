<script lang="ts">

	export var uuidv4: () => string
	export var luxon: {
		DateTime: DateTime
	}

	export const model: Model = init()

	import { Note } from './note.js'
	import { Model as ProjectManager } from './projectGroup'
	import type { ItemGroup as ProjectGroup } from './projectGroup'

	// for luxon
	interface DateTime {
		fromMillis: (milliseconds: number) => DateTime
		toLocaleString: (locale: Object) => string
		TIME_24_SIMPLE: Object
		DATETIME_SHORT: Object
	}

	type Model = {
		note: Note
		newText: string
		projectName: Project
		projectManager: ProjectManager
		projectNames: Project[]
		draggingProjectGroup: ProjectGroup
	}

	type Project = string

	type PairsOfProjectAndItems = Array<[string, Item[]]>

	interface Item {
		id: string
		content: string
		createdAt: number
		projectName: Project
	}

	
	function toLocaleString(timestamp: number): string {
		return luxon.DateTime.fromMillis(timestamp).toLocaleString(luxon.DateTime.TIME_24_SIMPLE)
	}

	function init(): Model {
		let note = new Note()
		note.gotItems(Note.restore())

		// const pairs: PairsOfProjectAndItems = toPairs(note.items)
		// const projectGroups = pairs.map(([projectName, _]) => {
		// 	return [ projectName ]
		// })

		return {
			note,
			newText: '',
			projectName: '',
			projectManager: new ProjectManager(),
			projectNames: [],
			draggingProjectGroup: null
		}
	}

	function add() {
		_log('add')

		const projectName = model.projectName
		const item: Item = {
			id: uuidv4(),
			content: model.newText,
			createdAt: Date.now(),
			projectName
		}

		model.note = model.note.add(item)
		model.note.store()

		const found = model.projectNames.find(v => v === projectName)
		if (! found) {
			model.projectNames.push(projectName)
			model.projectManager = model.projectManager.add(projectName)
		}

		model.newText = ''

	}

	function toPairs(items: Item[]): PairsOfProjectAndItems {
		let map = {}

		const orderedItems: Item[] = items.sort((a, b) => b.createdAt - a.createdAt)

		for (let item of orderedItems) {
			const found = map[item.projectName]

			if (found) {
				found.push(item)
			}
			else {
				map[item.projectName] = [item]
			}
		}

		return Object.entries(map)
	}

	function toDuration(items: Item[]): number {
		const a = items.map(v => v.createdAt)
		const min = Math.min(...a)
		const max = Math.max(...a)

		return max - min
	}

	function projectToDuration(projectName: string): number {
		const items = model.note.items.filter(v => v.projectName === projectName)

		return toDuration(items)
	}

	// function projectGroupToDuration(model: Model, projectGroup: ProjectGroup): number {
	// 	const pairs: PairsOfProjectAndItems = toPairs(model.note.items)

	// 	const sum: number = projectGroup.reduce((acc, cur) => {
	// 		const pair = pairs.find(([projectName, _]) => projectName === cur)
	// 		const items = pair[1]
	// 		return acc + toDuration(items)
	// 	}, 0)

	// 	return sum
	// }

	function clickedProjectNameField(projectName: string) {
		_log('clickedProjectNameField', projectName)

		model.projectName = projectName
	}

	function dragStarted(g: ProjectGroup) {
		_log('dragStarted', g)

		model.draggingProjectGroup = g
	}

	function dropped(g: ProjectGroup) {
		_log('dropped', g)

		model.projectManager = model.projectManager.absorb(g, model.draggingProjectGroup)
	}

	function allowDrop(e: Event, g: ProjectGroup) {
		if (ProjectManager.allowDrop(model.draggingProjectGroup, g)) {
			e.preventDefault() // Allow drop
		}
	}

	function _log(...v: any[]) {
		console.log(...v)

		return v
	}

	function hashTo360(str: string): number {
		const b = 360
		const c = 17

		return Array.from(str).reduce((acc, cur) => {
			const n = cur.charCodeAt(0)

			return ((acc * n + c) % b)
		}, 1)
	}

	function toColorText(projectName: string): string {
		if (projectName.length === 0) {
			return ''
		}
		else {
			const color = hashTo360(projectName)
			return `background-color: hsl(${color}, 100%, 90%)`
		}
	}
	</script>

<main class="flex">
	<div style="max-width: 380px;">
		{(console.log('->', model), '')}

		<form id="form-new-item" on:submit|preventDefault={add}>
			<input id="input-new-text" bind:value={model.newText} placeholder="new comment">
			<button>+</button>
			<textarea
				style={toColorText(model.projectName)}
				bind:value={model.projectName}
				placeholder="project name"
			></textarea>
		</form>
		<div id="items" class="flex flex-col">
			{#each toPairs(model.note.items) as [projectName, items]}
				<div class="border-b">
					{#each items.sort((a, b) => b.createdAt - a.createdAt) as item}
						<div style={toColorText(item.projectName)} class="">
							<div class="">
								<span class="text-sm text-gray-500">{toLocaleString(item.createdAt)}</span>

							</div>
							<div>
								&gt;
								{item.content}
							</div>
						</div>
					{/each}
					<div style={toColorText(projectName)} class="flex justify-between">
						<span class="text-sm flex-grow w-32">Total: {Math.floor(toDuration(items) / (60*1000))} min. </span>
						<span class="text-sm text-gray-500" on:click={() => clickedProjectNameField(projectName)}>
							[{projectName}]
						</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div style="width: 340px;" class="ml-2 pl-2 border-l border-dotted">
		<div class="text-2xl font-bold">
			Today
		</div>
		{#each model.projectManager.itemGroups as projectGroup}
			<div
				on:dragstart={_ => dragStarted(projectGroup)}
				on:drop={_ => dropped(projectGroup)}
				on:dragover={e => allowDrop(e, projectGroup)}
				draggable="true"
				style={toColorText(projectGroup.items[0])}
				class="w-full flex justify-between"
			>
				<div>
					{projectGroup.items[0]}
				</div>
				<div class="text-red-800">
					{Math.floor(projectToDuration(projectGroup.items[0]) / (60*1000))} min.
				</div>
			</div>
		{/each}
	</div>

</main>
