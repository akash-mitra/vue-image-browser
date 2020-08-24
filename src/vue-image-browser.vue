<template>
  <div class="w-full">
    <div
      v-show="pane === 'gallery'"
      class="w-full mx-auto py-4 bg-transparent my-4 flex items-center flex-no-wrap"
      id="top-panel"
    >
      <div class="flex-grow flex">
        <input
          class="p-2 w-full rounded-l-lg rounded-r-lg sm:rounded-r-none border sm:border-r-0 border-gray-300 bg-white outline-none"
          type="text"
          v-model="query"
          @keyup="doDelayedSearch"
          placeholder="search..."
        />
        <div
          class="hidden sm:flex relative pin-r rounded-r-lg border-r border-t border-b border-gray-300 bg-white py-1 px-2 items-center"
        >
          <span
            v-if="searchResult"
            class="py-1 px-2 bg-transparent rounded-lg text-xs whitespace-no-wrap"
            v-text="searchResult"
          ></span>
        </div>
      </div>
      <div class="flex-none" v-if="allowUpload">
        <button
          class="text-white bg-blue-600 mx-2 px-4 py-2 rounded"
          title="Upload Image"
          @click="pane = 'upload'"
        >
          Add Image
        </button>
      </div>
    </div>

    <div
      v-show="pane === 'gallery'"
      class="w-full flex flex-wrap thumbnail-container overflow-y-scroll"
    >
      <div
        v-for="photo in images"
        :key="photo.id"
        :class="imagesPerRow"
        @click="select(photo)"
      >
        <div
          class="bg-white shadow mr-4 mb-4 cursor-pointer"
          :class="selectedPhoto.id === photo.id ? 'border border-blue-600' : ''"
        >
          <div class="w-full flex items-center justify-center thumbnail">
            <img
              v-bind:data-src="photo.url"
              :title="photo.name"
              class="mg-photo"
            />
          </div>
          <div
            class="w-full flex bg-white justify-between text-gray-600 text-xs p-2"
          >
            <span class="truncate">{{ photo.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="pane === 'photo'"
      class="w-full mx-auto py-4 px-4 bg-transparent flex justify-between items-center"
    >
      <button class="flex items-center" @click="pane = 'gallery'">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          class="fill-current h-8 w-8 rounded-full border border-gray-600 p-2 text-gray-600 mr-2"
        >
          <polygon
            points="3.828 9 9.899 2.929 8.485 1.515 0 10 .707 10.707 8.485 18.485 9.899 17.071 3.828 11 20 11 20 9 3.828 9"
          />
        </svg>
        <p class="text-blue-700 text-xl">Back to Gallery</p>
      </button>

      <div class="flex items-center justify-between">
        <button
          @click="copy"
          v-if="allowCopy"
          class="py-2 px-6 text-blue-600 hover:text-blue-800 mt-4 ml-4"
        >
          {{ copyLinkText }}
        </button>
        <button
          @click="choose"
          v-if="allowChoose"
          class="py-2 px-6 bg-green-500 text-white rounded shadow text-xl mt-4 ml-4"
        >
          {{ chooseBtnText }}
        </button>
      </div>
    </div>

    <div v-if="pane === 'photo'" class="w-full px-4 postcard-container">
      <div class="w-full postcard">
        <img
          :src="selectedPhoto.url"
          :title="selectedPhoto.name"
          class="mx-auto shadow-lg mg-photo"
        />
      </div>

      <div class="w-full text-sm px-2 py-2 bg-white">
        <table class="w-full mt-4 table-auto">
          <tr class="border-b" v-for="(pk, pv) in imageProperties">
            <td class="p-4 uppercase font-semibold text-gray-600">
              {{ pk.toUpperCase() }}
            </td>
            <td class="p-4 font-mono">{{ selectedPhoto[pv] }}</td>
          </tr>
        </table>

        <button
          @click="deleteSelected()"
          v-if="allowDelete"
          class="text-red-500 border m-4 mt-6 px-4 text-sm py-1 hover:border border-red-500 hover:text-white hover:bg-red-500 rounded cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>

    <div
      v-if="pane === 'upload'"
      class="w-full p-4 postcard-container overflow-y-scroll"
    >
      <div class="flex justify-between">
        <button class="flex items-center" @click="pane = 'gallery'">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            class="fill-current h-8 w-8 rounded-full border p-2 text-gray-600 mr-2"
          >
            <polygon
              points="3.828 9 9.899 2.929 8.485 1.515 0 10 .707 10.707 8.485 18.485 9.899 17.071 3.828 11 20 11 20 9 3.828 9"
            />
          </svg>
          <p class="text-gray-600 font-light text-lg hidden sm:block">
            Back to Gallery
          </p>
        </button>
        <form id="file-catcher" enctype="multipart/form-data" method="post">
          <div class="w-full flex bg-transparent">
            <label
              class="flex items-center px-4 py-2 rounded-lg border border-blue-500 bg-white text-blue-500 tracking-wide cursor-pointer hover:bg-blue-500 hover:text-white"
            >
              <svg
                class="w-8 h-8 mr-4"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z"
                />
              </svg>
              <p class="text-base leading-normal">
                Upload
                <span class="hidden sm:inline">From Local Computer</span>
              </p>
              <input
                id="files"
                type="file"
                name="files"
                multiple
                class="hidden"
                @change="uploadFiles"
              />
            </label>
          </div>
        </form>
      </div>
      <div
        id="file-list-display"
        class="w-full my-4"
        v-if="uploadableFiles.length > 0"
      >
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
            <tr
              class="p-2 border-b"
              v-for="(f, index) in uploadableFiles"
              v-bind:key="index"
            >
              <td v-text="index + 1" class="text-left p-2 hidden md:block"></td>
              <td class="text-left p-2" v-text="f.name"></td>
              <td>
                <span v-text="f.status"></span>
              </td>
              <td>
                <progress
                  id="progressBar"
                  :value="f.completion"
                  max="100"
                  class="my-2 w-full"
                ></progress>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      class="p-2 bg-white w-full text-sm text-gray-600 rounded"
      id="message"
      v-if="message"
    >
      <span v-text="message"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'vue-image-browser',

  props: {
    images: {
      type: Array,
      default: () => [],
    },

    imageProperties: {
      type: Object,
    },

    allowUpload: {
      type: Boolean,
      default: false,
    },

    saveUrl: {
      type: String,
      default: '/api/photos',
    },

    saveRequestHeaders: {
      type: Object,
      default: () => {},
    },

    searchDelay: {
      type: Number,
      default: 500,
    },

    allowDelete: {
      type: Boolean,
      default: false,
    },

    allowPhotoPane: {
      type: Boolean,
      default: false,
    },

    allowChoose: {
      type: Boolean,
      default: false,
    },

    allowCopy: {
      type: Boolean,
      default: true,
    },

    captionable: {
      type: Boolean,
      default: false,
    },

    enableLazyLoad: {
      type: Boolean,
      default: true,
    },

    maxImagesPerRow: {
      type: Number,
      default: 5,
    },
  },

  data: function () {
    return {
      message: null,
      query: '',
      searchResult: null,
      pane: 'gallery',
      selectedPhoto: {},
      uploadableFiles: [],
      copyLinkText: 'Copy Link',
      chooseBtnText: 'Choose',
    }
  },

  created() {
    this.$nextTick(function () {
      if (this.enableLazyLoad) {
        this.enableLazyLoading()
      }
    })
  },

  updated: function () {
    this.$nextTick(function () {
      if (this.enableLazyLoad) {
        this.enableLazyLoading()
      }
    })
  },

  computed: {
    imagesPerRow() {
      let xs = parseInt(this.maxImagesPerRow * (1 / 4)),
        md = parseInt(this.maxImagesPerRow * (2 / 4)),
        lg = parseInt(this.maxImagesPerRow * (3 / 4)),
        xl = parseInt(this.maxImagesPerRow * (4 / 4))

      return (
        'w-full w-1/' + xs + ' md:w-1/' + md + ' lg:w-1/' + lg + ' xl:w-1/' + xl
      )
    },
  },

  methods: {
    select(photo) {
      this.selectedPhoto = photo

      this.allowPhotoPane && (this.pane = 'photo')

      this.captionable && (this.selectedPhoto['caption'] = this.getCaption())

      this.$emit('selected', this.selectedPhoto)
    },

    choose: function () {
      this.captionable && (this.selectedPhoto['caption'] = this.getCaption())

      this.$emit('chosen', this.selectedPhoto)

      this.pane = 'gallery'
    },

    copy() {
      let p = this

      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.selectedPhoto.url).then(() => {
          p.copyLinkText = 'Link Copied!'
        })
      }
    },

    getCaption() {
      // remove file name extensions
      let caption = this.selectedPhoto.name.replace(/\.[^/.]+$/, '')

      // remove special characters with space
      caption = caption.replace(/[^\w\s]/gi, ' ')

      // uppercase first letter of each word
      caption = caption
        .toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ')

      return prompt('Enter an caption for this image', caption)
    },

    uploadFiles: function () {
      let files = document.getElementById('files').files,
        p = this

      for (let i = 0; i < files.length; i++) {
        let upf = {
          name: files[i].name,
          formdata: new FormData(),
          ajax: new XMLHttpRequest(),
          status: 'Not Started',
          completion: 0,
        }

        upf.formdata.append('image', files[i])
        upf.formdata.append('name', files[i].name)

        upf.ajax.upload.onprogress = function (e) {
          upf.status = 'Uploaded ' + Math.round(e.loaded / 1000) + ' KB...'
          upf.completion = Math.round((e.loaded / e.total) * 100)
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

        upf.ajax.open('POST', p.saveUrl)

        let header_keys = Object.keys(p.saveRequestHeaders)
        for (let i = 0; i < header_keys.length; i++) {
          let header = header_keys[i]
          let val = p.saveRequestHeaders[header]
          upf.ajax.setRequestHeader(header, val)
        }

        upf.ajax.onreadystatechange = function () {
          if (upf.ajax.readyState === 4 && upf.ajax.status === 200) {
            let response = upf.ajax.responseText
            if (response) {
              try {
                let media = JSON.parse(response)
                p.$emit('saved', media)
              } catch (e) {
                alert(e)
              }
            }
          }
          if (upf.ajax.readyState === 4 && upf.ajax.status != 200) {
            upf.status =
              'Error uploading the file (Status = ' + upf.ajax.status + ')'
            upf.completion = 0
          }
        }
        upf.ajax.send(upf.formdata)
        this.uploadableFiles.push(upf)
      }
    },

    deleteSelected() {
      this.$emit('deleted', this.selectedPhoto)
      this.pane = 'gallery'
    },

    doDelayedSearch() {
      let p = this

      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }

      if (p.query.length > 0) p.searchResult = 'Searching...'
      else p.searchResult = ''

      this.timer = setTimeout(() => {
        p.$emit('searched', p.query)
      }, this.searchDelay)
    },

    // This is an experimental function that enables
    // lazy-loading.
    enableLazyLoading() {
      let images = document.querySelectorAll('.mg-photo')

      const config = {
        root: null,
        rootMargin: '0px 0px 50px 0px',
      }

      // check if intersection observer is supported via browser
      if (!('IntersectionObserver' in window)) {
        // if not, just load all immediately
        Array.from(images).forEach(function (image) {
          console.log('IntersectionObserver unsupported loading')
          if (!image.src) image.src = image.dataset.src
        })
      } else {
        let observer = new IntersectionObserver(function (entries) {
          entries.forEach((image) => {
            // Are we in viewport?
            if (image.isIntersecting) {
              // console.log('Loading: ' + image.target.dataset.src)
              // console.log(image.target.src)
              image.target.src = image.target.dataset.src
              observer.unobserve(image.target)
            }
          })
        }, config)

        images.forEach((image) => {
          if (!image.src) {
            observer.observe(image)
          }
        })
      }
    },
  },
}
</script>

<style>
@media only screen and (min-width: 640px) {
  .thumbnail {
    height: 300px;
    overflow: hidden;
  }
}
@media only screen and (min-width: 768px) {
  .thumbnail {
    height: 250px;
    overflow: hidden;
  }
}
@media only screen and (min-width: 1024px) {
  .thumbnail {
    height: 200px;
    overflow: hidden;
  }
}
@media only screen and (min-width: 1280px) {
  .thumbnail {
    height: 120px;
    overflow: hidden;
  }
}

.mg-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
