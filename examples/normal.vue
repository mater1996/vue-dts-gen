<script lang="ts">
import { defineComponent } from 'vue'

export interface Test2 {
  a: string
}

export default defineComponent({
  props: {
    /** Initial number */
    start: {
      type: Number,
      required: true,
    },
  },
})
</script>
