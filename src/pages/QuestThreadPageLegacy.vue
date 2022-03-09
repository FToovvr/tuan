<script setup lang="ts">
import { useStuffStore } from '~/stores/stuff'

const route = useRoute()
const router = useRouter()

interface Params {
    folder: string
    quest: string
    page: string
}
const params = route.params as unknown as Params
let { folder, quest, page } = $(reactive({ ...params }))

const stuffStore = useStuffStore()

new Promise(async () => {
    await until(toRef(stuffStore, 'isInitialized')).toBe(true)

    const id = stuffStore.convertLegacyPathToId(folder, quest)
    router.replace({
        path: `${stuffStore.entrypoint}/quests/${id}/pages/${page}`,
        params: route.params,
        hash: route.hash,
    })
})

</script>