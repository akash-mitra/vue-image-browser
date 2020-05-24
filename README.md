# An Image Browser Component Built with VueJs

![](images/example-image-1.png)


## Usage

```
npm install @akashmitra/vue-image-browser
```
To use this inside another Vue component, you must `import` this as a component.

```
<template>
    <VueImageBrowser
        source="api/images"
        selectable
        deletable
        @selected="onSelect"></VueImageBrowser>

</template>
<script>
import VueImageBrowser from '@akashmitra/vue-image-browser'

export default {
    components: {
        VueImageBrowser,
    },
    methods: {
        onSelect() {

        }
    }
}
</script>

```

## Image Object

The browser assumes that the `source` URL returns an array of `image` objects of following format.

```
{
    data: [
        {
            id: 1,
            name: 'image-name.jpg',
            type: 'jpeg',
            size: 10,
            url: 'www.example.com/image-name.jpg',
            storage: 'public',
            user_id: 1,
            created_ago: '2 days ago'
        },
        {...},
        {...}
    ]
}


```

## Options
`source` - Specify the URL that returns an array of the `image` objects
`selectable` - If this is true, you can select an image from the browser and a `selected` event will be generated and the corresponding `image` object will be passed to the event handler.
`deletable` - If this is true, the browser will show a Delete button. Clicking the Delete button will generate a `deleted` event and the corresponding `image` object will be passed to the event handler.
`lazyload` - When this is true, only the images that are within the viewport will be actually downloaded. By default it is true.