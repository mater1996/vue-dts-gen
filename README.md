# vue-dts-gen

forked from [vue-dts-gen](https://badgen.net/npm/v/vue-dts-gen)

## CHANGE

- support import type from `.vue` files.
- support ts transform hook
- use tsconfig as internal configuration

Generate `d.ts` from `.vue` files.

## Install

Globally:

```bash
npm i -g vue-dts-generator
```

Or locally:

```
npm i -D vue-dts-generator
```

## Usage

`ts-config.json`

```json
{
  "declaration": true,
  "declarationDir": "lib",
  "emitDeclarationOnly": true,
  "include": ["src/**/*.vue", "src/**/*.ts"]
}
```

```bash
vue-dts-generator --log
# Emits ${declarationDir}/*.d.ts
```

## Example

**Input:**

```vue
<script lang="ts">
import { defineComponent } from 'vue'

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
```

**Output:**

<!-- prettier-ignore -->
```ts
declare const _default: import("vue").DefineComponent<{
    /** Initial number */
    start: {
        type: NumberConstructor;
        required: true;
    };
}, unknown, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    start: number;
} & {}>, {}>;
export default _default;
```

**Input:**

```vue
<template>
  <div>hi</div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'

defineProps<{
  /** The initial number */
  start: number
}>()
</script>
```

**Output**:

<!-- prettier-ignore -->
```ts
declare const _default: import("vue").DefineComponent<{
    /** The initial number */
    start: number;
}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, import("vue").EmitsOptions, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{} & {
    start?: number | undefined;
}>, {}>;
export default _default;
```

## License

MIT &copy; [mater1996](https://github.com/sponsors/mater1996)
