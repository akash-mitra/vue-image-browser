# An Image Browser Component Built with VueJs

![Image Gallery](images/example-image-1.png)



## Usage
Install as npm package

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

| Parameter           | Description                                                                                                                                                                                      |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `source`            | Specify the URL that returns an array of the  `image`  objects                                                                                                                                   |
| `save_url`          | (OPTIONAL) Specify the URL to send POST requests for uploading new images                                                                                                                                   |
| `request_headers`   | (OPTIONAL) An object containing key-value pairs, where each key and the corresponding value is sent as custom request header in the post requests. See an example below.                                    |
| `selectable`        | (OPTIONAL, default `false`) If this is true, you can select an image from the browser and a  `selected`  event will be generated and the corresponding  `image`  object will be passed to the event handler.                 |
| `deletable`         | (OPTIONAL, default `false`) If this is true, the browser will show a Delete button. Clicking the Delete button will generate a  `deleted`  event and the corresponding  `image`  object will be passed to the event handler. |
| `lazyload`          | (OPTIONAL, default `true`) When this is true, only the images that are within the viewport will be actually downloaded. By default it is true.                                                                              |
|                     |                                                                                                                                                                                                  |


### Example with custom POST request header

```
<template>
    <VueImageBrowser
            source="api/images"
            save_url="api/images"
            request_headers="headers"
            selectable
            deletable
            @selected="onSelect"
            @deleted="onDelete"
            >
    </VueImageBrowser>
</template>

<script>
    import VueImageBrowser from '@akashmitra/vue-image-browser'

    export default {

        components: {
            VueImageBrowser,
        },

        data() {
            return {
                headers: {
                    // this header will be automatically appended with POST request
                    "X-CSRF-Token": document.head.querySelector('meta[name="csrf-token"]').content
                }
            }
        },

        methods: {
            onSelect(image) {
                // do something with the image
            },

            onDelete(image) {
                // send server request to delete the image
            }
        }
    }
</script>

```