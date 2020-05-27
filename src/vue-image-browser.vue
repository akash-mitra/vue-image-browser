<template>

        <div class="w-full">

                <div v-show="pane==='gallery'" class="w-full mx-auto py-4 bg-transparent my-4 flex items-center flex-no-wrap" id="top-panel">
                        <div class="flex-grow flex">
                                <input class="p-2 w-full rounded-l-lg rounded-r-lg sm:rounded-r-none border-l-2 border-r-2 sm:border-r-0 border-t-2 border-b-2 border-gray-300 bg-white"
                                        type="text"
                                        v-model="query"
                                        @keyup="doDelayedSearch"
                                        placeholder="search..."/>
                                <div class="hidden sm:flex relative pin-r rounded-r-lg border-r-2 border-t-2 border-b-2 border-gray-300 bg-white py-1 px-2  items-center">
                                        <span v-if="searchResult" class="py-1 px-2 bg-transparent rounded-lg text-xs whitespace-no-wrap" v-text="searchResult"></span>
                                </div>
                        </div>
                        <div class="flex-none">
                            <button class="text-blue-600 mx-2 px-4" title="Upload Image" @click="pane='upload'">
                                    Upload
                            </button>
                        </div>
                </div>

                <div v-show="pane==='gallery'" class="w-full flex flex-wrap thumbnail-container overflow-y-scroll">
                        <div v-for="photo in photos" :key="photo.id" class="w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5" @click="select(photo)">

                                <div class="bg-white shadow mr-4 mb-4 cursor-pointer">
                                        <div class="w-full flex items-center justify-center thumbnail">
                                                <img v-bind:data-src="photo.url" :title="photo.name" class="mg-photo"/>
                                        </div>
                                        <div class="w-full flex bg-white justify-between text-gray-600 text-xs p-2">
                                                <span v-text="photo.storage.toUpperCase()"></span>
                                                <span>{{ photo.size }} KB</span>
                                        </div>
                                </div>
                        </div>
                </div>


                <div v-if="pane==='photo'" class="w-full mx-auto py-4 px-4 bg-transparent flex justify-between items-center">
                        <button class="flex items-center" @click="pane='gallery'">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="fill-current h-8 w-8 rounded-full border border-gray-600 p-2 text-gray-600 mr-2"><polygon points="3.828 9 9.899 2.929 8.485 1.515 0 10 .707 10.707 8.485 18.485 9.899 17.071 3.828 11 20 11 20 9 3.828 9"/></svg>
                                <p class="text-blue-700 text-xl">All Photos</p>
                        </button>
                        <span @click="deleteSelected()" v-if="deletable" class="text-red-500 mr-4 px-2 text-sm py-1 hover:border border-red-500 hover:text-white hover:bg-red-500 rounded cursor-pointer">Delete </span>
                </div>

                <div v-if="pane==='photo'" class="w-full px-4 postcard-container">

                    <div class="w-full postcard">
                            <img :src="selectedPhoto.url" :title="selectedPhoto.name" class="mx-auto shadow-lg mg-photo"/>
                    </div>

                    <div class="w-full text-sm px-2 py-2 bg-white">

                        <button v-if="selectable" class="py-2 px-6 bg-green-500 text-white rounded shadow text-xl mt-4 ml-4" @click="choose">Select</button>

                        <table class="w-full mt-4 table-auto">
                            <tr class="border-b">
                                <td class="p-4 uppercase font-semibold text-gray-600">Media ID</td>
                                <td class="p-4 font-mono">{{selectedPhoto.id}}</td>
                            </tr>
                            <tr class="border-b">
                                <td class="p-4 uppercase font-semibold text-gray-600">Original Media Name</td>
                                <td class="p-4 font-mono">{{selectedPhoto.name}}</td>
                            </tr>
                            <tr class="border-b">
                                <td class="p-4 uppercase font-semibold text-gray-600">Media Type</td>
                                <td class="p-4 font-mono">{{selectedPhoto.type}}</td>
                            </tr>
                            <tr class="border-b">
                                <td class="p-4 uppercase font-semibold text-gray-600">File Size</td>
                                <td class="p-4 font-mono">{{selectedPhoto.size}} KB</td>
                            </tr>
                            <tr class="border-b">
                                <td class="p-4 uppercase font-semibold text-gray-600">File Path</td>
                                <td class="p-4 font-mono">{{selectedPhoto.path}}</td>
                            </tr>
                            <tr class="border-b">
                                <td class="p-4 uppercase font-semibold text-gray-600">Media URL</td>
                                <td class="p-4 font-mono">{{selectedPhoto.url}}</td>
                            </tr>
                            <tr class="border-b">
                                <td class="p-4 uppercase font-semibold text-gray-600">Storage Type</td>
                                <td class="p-4 font-mono">{{selectedPhoto.storage}}</td>
                            </tr>
                            <tr class="border-b">
                                <td class="p-4 uppercase font-semibold text-gray-600">Created</td>
                                <td class="p-4 font-mono">{{selectedPhoto.created_ago}}</td>
                            </tr>
                            <tr class="">
                                <td class="p-4 uppercase font-semibold text-gray-600">Uploader ID</td>
                                <td class="p-4 font-mono">{{selectedPhoto.user_id}}</td>
                            </tr>
                        </table>

                    </div>

                </div>

                <div v-if="pane==='upload'" class="w-full p-4 postcard-container overflow-y-scroll">

                        <div class="flex justify-between">
                                <button class="flex items-center" @click="pane='gallery'">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="fill-current h-8 w-8 rounded-full border p-2 text-gray-600 mr-2"><polygon points="3.828 9 9.899 2.929 8.485 1.515 0 10 .707 10.707 8.485 18.485 9.899 17.071 3.828 11 20 11 20 9 3.828 9"/></svg>
                                        <p class="text-gray-600 font-light text-lg hidden sm:block">Back to Gallery</p>
                                </button>
                                <form id='file-catcher' enctype="multipart/form-data" method="post">
                                        <div class="w-full flex bg-transparent">
                                                <label class="flex items-center px-4 py-2 rounded-lg border border-blue-500 bg-white text-blue-500 tracking-wide cursor-pointer hover:bg-blue-500 hover:text-white">
                                                        <svg class="w-8 h-8 mr-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                                <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                                                        </svg>
                                                        <p class="text-base leading-normal ">Upload <span class="hidden sm:inline">From Local Computer</span></p>
                                                        <input id='files' type='file' name="files" multiple class="hidden" @change="uploadFiles" />
                                                </label>
                                        </div>
                                </form>
                        </div>
                        <div id='file-list-display' class="w-full my-4" v-if="uploadableFiles.length > 0">
                                <table class="w-full my-2 text-sm">
                                        <thead>
                                                <tr class="bg-white text-left">
                                                        <th class="p-2 font-light hidden md:block">#</th>
                                                        <th class="p-2 font-light">File Name</th>
                                                        <th class="p-2 font-light">Status</th>
                                                        <th class="p-2 font-light">Progress</th>
                                                </tr>
                                        </thead>
                                        <tbody>
                                                <tr class="p-2 border-b" v-for="(f, index) in uploadableFiles" v-bind:key="index">
                                                        <td v-text="index+1" class="text-left p-2 hidden md:block"></td>
                                                        <td class="text-left p-2" v-text="f.name"></td>
                                                        <td>
                                                                <span v-text="f.status"></span>
                                                        </td>
                                                        <td>
                                                                <progress id="progressBar" :value="f.completion" max="100" class="my-2 w-full"></progress>
                                                        </td>
                                                </tr>
                                        </tbody>
                                </table>
                        </div>
                </div>

                <div class="p-2 bg-white w-full text-sm text-gray-600 rounded" id="message" v-if="message">
                        <span v-text="message"></span>
                </div>
        </div>
</template>

<script>
export default {

        name: 'vue-image-browser',

        props: {
            source: {
                type: String,
                default: '/api/photos'
            },

            save_url: {
                type: String,
                default: '/api/photos'
            },

            request_headers: {
                type: Object,
                default: {}
            },

            deletable: {
                    type: Boolean,
                    default: false
            },
            selectable: {
                    type: Boolean,
                    default: false
            },
            lazyload: {
                    type: Boolean,
                    default: true
            }
        },
        data: function () {
                return {
                        photos: [],
                        message: 'Loading Images...',
                        query: '',
                        searchResult: null,
                        pane: 'gallery',
                        selectedPhoto: {},
                        uploadableFiles: [],
                }
        },
        created: function () {
                this.getFromServer()
        },

        updated: function () {
                this.enableLazyLoad()
        },

        methods: {
                doDelayedSearch() {

                    let p = this

                    if (this.timer) {
                        clearTimeout(this.timer);
                        this.timer = null;
                    }

                    p.searchResult = 'Searching...'

                    this.timer = setTimeout(() => {

                        p.getFromServer(p.query)
                    }, 800)

                },

                select(photo) {
                        this.pane = 'photo'
                        this.selectedPhoto = photo
                },

                choose: function () {

                        // remove file name extensions
                        let caption = this.selectedPhoto.name.replace(/\.[^/.]+$/, "")

                        // remove special characters with space
                        caption = caption.replace(/[^\w\s]/gi, ' ')

                        // uppercase first letter of each word
                        caption = caption.toLowerCase()
                                .split(' ')
                                .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                                .join(' ');

                        var captionChosen = prompt('Enter an caption for this image', caption)
                        //TODO we should remove any double quote in captionChosen
                        this.selectedPhoto['caption'] = captionChosen

                        this.$emit('selected', this.selectedPhoto)
                },

                uploadFiles: function () {
                        let files = document.getElementById('files').files,
                            p = this;
                        for(let i = 0; i < files.length; i++) {
                                let upf = {
                                        name: files[i].name,
                                        formdata: new FormData(),
                                        ajax: new XMLHttpRequest(),
                                        status: 'Not Started',
                                        completion: 0
                                };

                                upf.formdata.append('image', files[i])
                                upf.formdata.append('name', files[i].name)
                                // upf.formdata.append("Content-Type", files[i].type);

                                upf.ajax.upload.onprogress = function (e) {
                                        upf.status = 'Uploaded ' + Math.round(e.loaded/1000) + ' KB...'
                                        upf.completion = Math.round((e.loaded/e.total)*100)
                                }
                                upf.ajax.upload.onload = function (e) {
                                        upf.status = 'Complete'
                                        upf.completion = 100
                                }
                                upf.ajax.upload.onerror = function (e) {
                                        upf.status = 'Error uploading the file'
                                        upf.completion = 0
                                }
                                // ajax.upload.addEventListener('abort', abortHandler, false);

                                upf.ajax.open('POST', p.save_url)

                                let header_keys = Object.keys(p.request_headers)
                                for (let i=0; i < header_keys.length; i++) {
                                        let header = header_keys[i]
                                        let val = p.request_headers[header]
                                        upf.ajax.setRequestHeader(header, val)
                                }

                                upf.ajax.onreadystatechange = function () {
                                    if (upf.ajax.readyState === 4 && upf.ajax.status === 200) {
                                        let response = upf.ajax.responseText
                                        if(response) {
                                            try {
                                                let media = JSON.parse(response);
                                                p.photos.push(media.file)
                                            } catch(e) {
                                                alert(e);
                                            }
                                        }
                                    }
                                    if (upf.ajax.readyState === 4 && upf.ajax.status != 200) {
                                        upf.status = 'Error uploading the file (Status = ' + upf.ajax.status + ')'
                                        upf.completion = 0
                                    }
                                };
                                upf.ajax.send(upf.formdata)
                                this.uploadableFiles.push(upf)
                        }
                },

                // Gets media data from the server. If a query string is
                // provided then only returns the data that fulfill
                // the search conditions in query string.
                getFromServer1: function (query, callback) {
                        const p = this
                        let url = this.source + ((typeof query != 'undefined' && query != null) ? '?query=' + encodeURIComponent(query):'')
                        axios.get(url)
                        .then(function (response) {
                                p.photos = response.data.data
                                p.message = null
                                p.searchResult = response.data.total + ' image(s)'
                                if (typeof callback != 'undefined') callback.call()
                        })
                        .catch(function (error) {
                                p.message = 'Request failed with ' + error.response.status + ': ' + error.response.statusText
                                if (error.response.status == '403') { // special helpful message for loggedout situations
                                        p.message += '. Make sure you are logged in or refresh the page.'
                                }
                        })
                },

                getFromServer(query) {
                        const p = this
                        let url = this.source + ((typeof query != 'undefined' && query != null) ? '?query=' + encodeURIComponent(query):'')

                        let xhr = new XMLHttpRequest()
                        xhr.open('GET', url)
                        xhr.responseType = 'json'
                        xhr.send()

                        xhr.onload = function() {
                                let responseObj = xhr.response;
                                p.photos = response.data
                                p.message = null
                                p.searchResult = response.data.total + ' image(s)'
                        }

                        xhr.onerror = function() {
                                p.message = 'Failed to load images from the server. Please reload the page.'
                        };
                },


                deleteSelected() {

                    this.$emit('deleted', this.selectedPhoto)
                },


                // This is an experimental function that enables
                // lazy-loading.
                enableLazyLoad: function () {
                        let images = document.querySelectorAll('.mg-photo');

                        const config = {
                                root: document.querySelector('.top-panel'),
                                // If the image gets within 100px in the Y axis, start the download.
                                rootMargin: '0px 0px 50px 0px'
                        };

                        // check if intersection observer is supported via browser
                        if (!('IntersectionObserver' in window) || this.lazyload === false) {
                                // if not, just load all immediately
                                Array.from(images).forEach(function(image) {
                                        console.log('IntersectionObserver unsupported loading')
                                        if(! image.src) image.src = image.dataset.src
                                })
                        } else {
                                // The observer is supported
                                let observer = new IntersectionObserver(function (entries) {
                                        // Loop through the entries
                                        entries.forEach(image => {
                                                // Are we in viewport?
                                                if (image.isIntersecting) {
                                                        // Stop watching and load the image
                                                        // console.log('Loading: ' + image.target.dataset.src)
                                                        observer.unobserve(image.target)
                                                        // console.log(image.target.src)
                                                        image.target.src = image.target.dataset.src
                                                }
                                        })
                                }, config)

                                // start observing...
                                images.forEach(image => {
                                        if(! image.src) {
                                            observer.observe(image)
                                        }
                                })
                        }
                },
        }
}
</script>

<style>
        .thumbnail-container {

        }
        .thumbnail {
            height: 100px;
            overflow: hidden;
        }

        .postcard-container {


        }

        .postcard  {

        }

        .mg-photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

</style>
