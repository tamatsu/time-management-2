<script lang="ts">
	export var uuidv4: () => string
	export var luxon: {
		DateTime: DateTime
	}

	export const model: Model = init()

	import { Note } from './note.js'

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
		projectName: string
	}

	interface Item {
		id: string
		content: string
		createdAt: number
		projectName: string
	}

	
	function toLocaleString(timestamp: number): string {
		return luxon.DateTime.fromMillis(timestamp).toLocaleString(luxon.DateTime.TIME_24_SIMPLE)
	}

	function init(): Model {
		let note = new Note()
		note.gotItems(Note.restore())

		return {
			note,
			newText: '',
			projectName: '',
		}
	}

	function add() {
		_log('add')

		const item: Item = {
			id: uuidv4(),
			content: model.newText,
			createdAt: Date.now(),
			projectName: model.projectName 
		}

		model.note = model.note.add(item)
		model.note.store()

		model.newText = ''

	}

	function toMap(items: Item[]): Array<[string, Item[]]> {
		let map = {}

		const orderedItems = items.sort((a, b) => b.createdAt - a.createdAt)

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

	function clickedProjectNameField(projectName: string) {
		_log('clickedProjectNameField', projectName)

		model.projectName = projectName
	}

	function _log(...v: any[]) {
		console.log(...v)

		return v
	}

</script>

<main style="max-width: 480px;">
	{(console.log('->', model), '')}

	<form id="form-new-item" on:submit|preventDefault={add}>
		<input id="input-new-text" bind:value={model.newText} placeholder="new comment">
		<button>+</button>
		<textarea bind:value={model.projectName} placeholder="project name"></textarea>
	</form>
	<div id="items" class="flex flex-col">
	{#each toMap(model.note.items) as [projectName, items]}
		<div class="border-b">
		{#each items.sort((a, b) => b.createdAt - a.createdAt) as item}
			<div class="">
				<div class="">
					<span class="text-sm text-gray-500">{toLocaleString(item.createdAt)}</span>

				</div>
				<div>
					&gt;
					{item.content}
				</div>
			</div>
		{/each}
			<div class="flex justify-between">
				<span class="text-sm flex-grow w-32">Total: {Math.floor(toDuration(items) / (60*1000))} min. </span>
				<span class="text-sm text-gray-500" on:click={() => clickedProjectNameField(projectName)}>
					[{projectName}]
				</span>
			</div>
		</div>
	{/each}
	</div>

</main>
