//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script = {
  name: 'vue-image-browser',

  props: {
    images: {
      type: Array,
      default: function () { return []; },
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
      default: function () {},
    },

    searchDelay: {
      type: Number,
      default: 500,
    },

    allowDelete: {
      type: Boolean,
      default: false,
    },

    allowRename: {
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
      renameQuery: '',
      searchResult: null,
      pane: 'gallery',
      selectedPhoto: {},
      uploadableFiles: [],
      copyLinkText: 'Copy Link',
      chooseBtnText: 'Choose',
    }
  },

  created: function created() {
    this.$nextTick(function () {
      if (this.enableLazyLoad) {
        this.enableLazyLoading();
      }
    });
  },

  updated: function () {
    this.$nextTick(function () {
      if (this.enableLazyLoad) {
        this.enableLazyLoading();
      }
    });
  },

  computed: {
    imagesPerRow: function imagesPerRow() {
      var xs = parseInt(this.maxImagesPerRow * (1 / 4)),
        md = parseInt(this.maxImagesPerRow * (2 / 4)),
        lg = parseInt(this.maxImagesPerRow * (3 / 4)),
        xl = parseInt(this.maxImagesPerRow * (4 / 4));

      return (
        'w-full w-1/' + xs + ' md:w-1/' + md + ' lg:w-1/' + lg + ' xl:w-1/' + xl
      )
    },

    isRenameDisabled: function isRenameDisabled() {
      return this.selectedPhoto.name === this.renameQuery
    },
  },

  methods: {
    select: function select(photo) {
      this.selectedPhoto = photo;

      this.renameQuery = photo.name;

      this.allowPhotoPane && (this.pane = 'photo');

      this.captionable && (this.selectedPhoto['caption'] = this.getCaption());

      this.$emit('selected', this.selectedPhoto);
    },

    choose: function () {
      this.captionable && (this.selectedPhoto['caption'] = this.getCaption());

      this.$emit('chosen', this.selectedPhoto);

      this.pane = 'gallery';
    },

    copy: function copy() {
      var p = this;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.selectedPhoto.url).then(function () {
          p.copyLinkText = 'Link Copied!';
        });
      }
    },

    getCaption: function getCaption() {
      // remove file name extensions
      var caption = this.selectedPhoto.name.replace(/\.[^/.]+$/, '');

      // remove special characters with space
      caption = caption.replace(/[^\w\s]/gi, ' ');

      // uppercase first letter of each word
      caption = caption
        .toLowerCase()
        .split(' ')
        .map(function (s) { return s.charAt(0).toUpperCase() + s.substring(1); })
        .join(' ');

      return prompt('Enter an caption for this image', caption)
    },

    uploadFiles: function () {
      var this$1 = this;

      var files = document.getElementById('files').files,
        p = this;

      var loop = function ( i ) {
        var upf = {
          name: files[i].name,
          formdata: new FormData(),
          ajax: new XMLHttpRequest(),
          status: 'Not Started',
          completion: 0,
        };

        upf.formdata.append('image', files[i]);
        upf.formdata.append('name', files[i].name);

        upf.ajax.upload.onprogress = function (e) {
          upf.status = 'Uploaded ' + Math.round(e.loaded / 1000) + ' KB...';
          upf.completion = Math.round((e.loaded / e.total) * 100);
        };
        upf.ajax.upload.onload = function (e) {
          upf.status = 'Complete';
          upf.completion = 100;
        };
        upf.ajax.upload.onerror = function (e) {
          upf.status = 'Error uploading the file';
          upf.completion = 0;
        };
        // ajax.upload.addEventListener('abort', abortHandler, false);

        upf.ajax.open('POST', p.saveUrl);

        var header_keys = Object.keys(p.saveRequestHeaders);
        for (var i$1 = 0; i$1 < header_keys.length; i$1++) {
          var header = header_keys[i$1];
          var val = p.saveRequestHeaders[header];
          upf.ajax.setRequestHeader(header, val);
        }

        upf.ajax.onreadystatechange = function () {
          if (upf.ajax.readyState === 4 && upf.ajax.status === 200) {
            var response = upf.ajax.responseText;
            if (response) {
              try {
                var media = JSON.parse(response);
                p.$emit('saved', media);
              } catch (e) {
                alert(e);
              }
            }
          }
          if (upf.ajax.readyState === 4 && upf.ajax.status != 200) {
            upf.status =
              'Error uploading the file (Status = ' + upf.ajax.status + ')';
            upf.completion = 0;
          }
        };
        upf.ajax.send(upf.formdata);
        this$1.uploadableFiles.push(upf);
      };

      for (var i = 0; i < files.length; i++) loop( i );
    },

    deleteSelected: function deleteSelected() {
      this.$emit('deleted', this.selectedPhoto);
      this.pane = 'gallery';
    },

    renameSelected: function renameSelected() {
      if (this.renameQuery.length <= 0)
        { return; }

      this.$emit('renamed', this.selectedPhoto, this.renameQuery);
    },

    doDelayedSearch: function doDelayedSearch() {
      var p = this;

      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      if (p.query.length > 0) { p.searchResult = 'Searching...'; }
      else { p.searchResult = ''; }

      this.timer = setTimeout(function () {
        p.$emit('searched', p.query);
      }, this.searchDelay);
    },

    // This is an experimental function that enables
    // lazy-loading.
    enableLazyLoading: function enableLazyLoading() {
      var images = document.querySelectorAll('.mg-photo');

      var config = {
        root: null,
        rootMargin: '0px 0px 50px 0px',
      };

      // check if intersection observer is supported via browser
      if (!('IntersectionObserver' in window)) {
        // if not, just load all immediately
        Array.from(images).forEach(function (image) {
          console.log('IntersectionObserver unsupported loading');
          if (!image.src) { image.src = image.dataset.src; }
        });
      } else {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (image) {
            // Are we in viewport?
            if (image.isIntersecting) {
              // console.log('Loading: ' + image.target.dataset.src)
              // console.log(image.target.src)
              image.target.src = image.target.dataset.src;
              observer.unobserve(image.target);
            }
          });
        }, config);

        images.forEach(function (image) {
          if (!image.src) {
            observer.observe(image);
          }
        });
      }
    },
  },
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    var options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    var hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            var originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            var existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

var isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return function (id, style) { return addStyle(id, style); };
}
var HEAD;
var styles = {};
function addStyle(id, css) {
    var group = isOldIE ? css.media || 'default' : id;
    var style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        var code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                { style.element.setAttribute('media', css.media); }
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            var index = style.ids.size - 1;
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index])
                { style.element.removeChild(nodes[index]); }
            if (nodes.length)
                { style.element.insertBefore(textNode, nodes[index]); }
            else
                { style.element.appendChild(textNode); }
        }
    }
}

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "w-full" }, [
    _c(
      "div",
      {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.pane === "gallery",
            expression: "pane === 'gallery'"
          }
        ],
        staticClass:
          "w-full mx-auto py-4 bg-transparent my-4 flex items-center flex-no-wrap",
        attrs: { id: "top-panel" }
      },
      [
        _c("div", { staticClass: "flex-grow flex" }, [
          _c("input", {
            directives: [
              {
                name: "model",
                rawName: "v-model",
                value: _vm.query,
                expression: "query"
              }
            ],
            staticClass:
              "p-2 w-full rounded-l-lg rounded-r-lg sm:rounded-r-none border sm:border-r-0 border-gray-300 bg-white outline-none",
            attrs: { type: "text", placeholder: "search..." },
            domProps: { value: _vm.query },
            on: {
              keyup: _vm.doDelayedSearch,
              input: function($event) {
                if ($event.target.composing) {
                  return
                }
                _vm.query = $event.target.value;
              }
            }
          }),
          _vm._v(" "),
          _c(
            "div",
            {
              staticClass:
                "hidden sm:flex relative pin-r rounded-r-lg border-r border-t border-b border-gray-300 bg-white py-1 px-2 items-center"
            },
            [
              _vm.searchResult
                ? _c("span", {
                    staticClass:
                      "py-1 px-2 bg-transparent rounded-lg text-xs whitespace-no-wrap",
                    domProps: { textContent: _vm._s(_vm.searchResult) }
                  })
                : _vm._e()
            ]
          )
        ]),
        _vm._v(" "),
        _vm.allowUpload
          ? _c("div", { staticClass: "flex-none" }, [
              _c(
                "button",
                {
                  staticClass: "text-white bg-blue-600 mx-2 px-4 py-2 rounded",
                  attrs: { title: "Upload Image" },
                  on: {
                    click: function($event) {
                      _vm.pane = "upload";
                    }
                  }
                },
                [_vm._v("\n        Add Image\n      ")]
              )
            ])
          : _vm._e()
      ]
    ),
    _vm._v(" "),
    _c(
      "div",
      {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.pane === "gallery",
            expression: "pane === 'gallery'"
          }
        ],
        staticClass:
          "w-full flex flex-wrap thumbnail-container overflow-y-scroll"
      },
      _vm._l(_vm.images, function(photo) {
        return _c(
          "div",
          {
            key: photo.id,
            class: _vm.imagesPerRow,
            on: {
              click: function($event) {
                return _vm.select(photo)
              }
            }
          },
          [
            _c(
              "div",
              {
                staticClass: "bg-white shadow mr-4 mb-4 cursor-pointer",
                class:
                  _vm.selectedPhoto.id === photo.id
                    ? "border border-blue-600"
                    : ""
              },
              [
                _c(
                  "div",
                  {
                    staticClass:
                      "w-full flex items-center justify-center thumbnail"
                  },
                  [
                    _c("img", {
                      staticClass: "mg-photo",
                      attrs: { "data-src": photo.url, title: photo.name }
                    })
                  ]
                ),
                _vm._v(" "),
                _c(
                  "div",
                  {
                    staticClass:
                      "w-full flex bg-white justify-between text-gray-600 text-xs p-2"
                  },
                  [
                    _c("span", { staticClass: "truncate" }, [
                      _vm._v(_vm._s(photo.name))
                    ])
                  ]
                )
              ]
            )
          ]
        )
      }),
      0
    ),
    _vm._v(" "),
    _vm.pane === "photo"
      ? _c(
          "div",
          {
            staticClass:
              "w-full mx-auto py-4 px-4 bg-transparent flex justify-between items-center"
          },
          [
            _c(
              "button",
              {
                staticClass: "flex items-center",
                on: {
                  click: function($event) {
                    _vm.pane = "gallery";
                  }
                }
              },
              [
                _c(
                  "svg",
                  {
                    staticClass:
                      "fill-current h-8 w-8 rounded-full border border-gray-600 p-2 text-gray-600 mr-2",
                    attrs: {
                      xmlns: "http://www.w3.org/2000/svg",
                      viewBox: "0 0 20 20"
                    }
                  },
                  [
                    _c("polygon", {
                      attrs: {
                        points:
                          "3.828 9 9.899 2.929 8.485 1.515 0 10 .707 10.707 8.485 18.485 9.899 17.071 3.828 11 20 11 20 9 3.828 9"
                      }
                    })
                  ]
                ),
                _vm._v(" "),
                _c("p", { staticClass: "text-blue-700 text-xl" }, [
                  _vm._v("Back to Gallery")
                ])
              ]
            ),
            _vm._v(" "),
            _c("div", { staticClass: "flex items-center justify-between" }, [
              _vm.allowCopy
                ? _c(
                    "button",
                    {
                      staticClass:
                        "py-2 px-6 text-blue-600 hover:text-blue-800 mt-4 ml-4",
                      on: { click: _vm.copy }
                    },
                    [
                      _vm._v(
                        "\n        " + _vm._s(_vm.copyLinkText) + "\n      "
                      )
                    ]
                  )
                : _vm._e(),
              _vm._v(" "),
              _vm.allowChoose
                ? _c(
                    "button",
                    {
                      staticClass:
                        "py-2 px-6 bg-green-500 text-white rounded shadow text-xl mt-4 ml-4",
                      on: { click: _vm.choose }
                    },
                    [
                      _vm._v(
                        "\n        " + _vm._s(_vm.chooseBtnText) + "\n      "
                      )
                    ]
                  )
                : _vm._e()
            ])
          ]
        )
      : _vm._e(),
    _vm._v(" "),
    _vm.pane === "photo"
      ? _c("div", { staticClass: "w-full px-4 postcard-container" }, [
          _c("div", { staticClass: "w-full postcard" }, [
            _c("img", {
              staticClass: "mx-auto shadow-lg mg-photo",
              attrs: {
                src: _vm.selectedPhoto.url,
                title: _vm.selectedPhoto.name
              }
            })
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "w-full text-sm px-2 py-2 bg-white" }, [
            _c(
              "table",
              { staticClass: "w-full mt-4 table-auto" },
              _vm._l(_vm.imageProperties, function(pk, pv) {
                return _c("tr", { staticClass: "border-b" }, [
                  _c(
                    "td",
                    {
                      staticClass: "p-4 uppercase font-semibold text-gray-600"
                    },
                    [
                      _vm._v(
                        "\n            " +
                          _vm._s(pk.toUpperCase()) +
                          "\n          "
                      )
                    ]
                  ),
                  _vm._v(" "),
                  _c("td", { staticClass: "p-4 font-mono" }, [
                    _vm._v(_vm._s(_vm.selectedPhoto[pv]))
                  ])
                ])
              }),
              0
            ),
            _vm._v(" "),
            _c(
              "div",
              {
                staticClass:
                  "w-full mx-auto py-4 bg-transparent my-4 flex items-center flex-no-wrap"
              },
              [
                _c("div", { staticClass: "flex-none px-3" }, [
                  _vm.allowDelete
                    ? _c(
                        "button",
                        {
                          staticClass:
                            "text-red-500 border px-4 text-sm py-2 hover:border border-red-500 hover:text-white hover:bg-red-500 rounded cursor-pointer",
                          on: {
                            click: function($event) {
                              return _vm.deleteSelected()
                            }
                          }
                        },
                        [_vm._v("\n            Delete\n          ")]
                      )
                    : _vm._e()
                ]),
                _vm._v(" "),
                _vm.allowRename
                  ? _c("div", { staticClass: "flex-grow flex px-3" }, [
                      _c("input", {
                        directives: [
                          {
                            name: "model",
                            rawName: "v-model",
                            value: _vm.renameQuery,
                            expression: "renameQuery"
                          }
                        ],
                        staticClass:
                          "p-2 w-full rounded-l-lg rounded-r-lg sm:rounded-r-none border sm:border-r-0 border-gray-300 bg-white outline-none",
                        attrs: { type: "text" },
                        domProps: { value: _vm.renameQuery },
                        on: {
                          input: function($event) {
                            if ($event.target.composing) {
                              return
                            }
                            _vm.renameQuery = $event.target.value;
                          }
                        }
                      }),
                      _vm._v(" "),
                      _c("div", { staticClass: "flex relative" }, [
                        _c(
                          "button",
                          {
                            staticClass:
                              "text-blue-500 px-4 text-sm py-1 hover:border hover:border-blue-500 hover:text-white hover:bg-blue-500 rounded-r-lg border-r border-t border-b border-gray-300 cursor-pointer",
                            class: _vm.isRenameDisabled
                              ? "opacity-50 cursor-not-allowed"
                              : "",
                            attrs: { disabled: _vm.isRenameDisabled },
                            on: {
                              click: function($event) {
                                return _vm.renameSelected()
                              }
                            }
                          },
                          [_vm._v("\n              Rename\n            ")]
                        )
                      ])
                    ])
                  : _vm._e()
              ]
            )
          ])
        ])
      : _vm._e(),
    _vm._v(" "),
    _vm.pane === "upload"
      ? _c(
          "div",
          { staticClass: "w-full p-4 postcard-container overflow-y-scroll" },
          [
            _c("div", { staticClass: "flex justify-between" }, [
              _c(
                "button",
                {
                  staticClass: "flex items-center",
                  on: {
                    click: function($event) {
                      _vm.pane = "gallery";
                    }
                  }
                },
                [
                  _c(
                    "svg",
                    {
                      staticClass:
                        "fill-current h-8 w-8 rounded-full border p-2 text-gray-600 mr-2",
                      attrs: {
                        xmlns: "http://www.w3.org/2000/svg",
                        viewBox: "0 0 20 20"
                      }
                    },
                    [
                      _c("polygon", {
                        attrs: {
                          points:
                            "3.828 9 9.899 2.929 8.485 1.515 0 10 .707 10.707 8.485 18.485 9.899 17.071 3.828 11 20 11 20 9 3.828 9"
                        }
                      })
                    ]
                  ),
                  _vm._v(" "),
                  _c(
                    "p",
                    {
                      staticClass:
                        "text-gray-600 font-light text-lg hidden sm:block"
                    },
                    [_vm._v("\n          Back to Gallery\n        ")]
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "form",
                {
                  attrs: {
                    id: "file-catcher",
                    enctype: "multipart/form-data",
                    method: "post"
                  }
                },
                [
                  _c("div", { staticClass: "w-full flex bg-transparent" }, [
                    _c(
                      "label",
                      {
                        staticClass:
                          "flex items-center px-4 py-2 rounded-lg border border-blue-500 bg-white text-blue-500 tracking-wide cursor-pointer hover:bg-blue-500 hover:text-white"
                      },
                      [
                        _c(
                          "svg",
                          {
                            staticClass: "w-8 h-8 mr-4",
                            attrs: {
                              fill: "currentColor",
                              xmlns: "http://www.w3.org/2000/svg",
                              viewBox: "0 0 20 20"
                            }
                          },
                          [
                            _c("path", {
                              attrs: {
                                d:
                                  "M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z"
                              }
                            })
                          ]
                        ),
                        _vm._v(" "),
                        _vm._m(0),
                        _vm._v(" "),
                        _c("input", {
                          staticClass: "hidden",
                          attrs: {
                            id: "files",
                            type: "file",
                            name: "files",
                            multiple: ""
                          },
                          on: { change: _vm.uploadFiles }
                        })
                      ]
                    )
                  ])
                ]
              )
            ]),
            _vm._v(" "),
            _vm.uploadableFiles.length > 0
              ? _c(
                  "div",
                  {
                    staticClass: "w-full my-4",
                    attrs: { id: "file-list-display" }
                  },
                  [
                    _c("table", { staticClass: "w-full my-2 text-sm" }, [
                      _vm._m(1),
                      _vm._v(" "),
                      _c(
                        "tbody",
                        _vm._l(_vm.uploadableFiles, function(f, index) {
                          return _c(
                            "tr",
                            { key: index, staticClass: "p-2 border-b" },
                            [
                              _c("td", {
                                staticClass: "text-left p-2 hidden md:block",
                                domProps: { textContent: _vm._s(index + 1) }
                              }),
                              _vm._v(" "),
                              _c("td", {
                                staticClass: "text-left p-2",
                                domProps: { textContent: _vm._s(f.name) }
                              }),
                              _vm._v(" "),
                              _c("td", [
                                _c("span", {
                                  domProps: { textContent: _vm._s(f.status) }
                                })
                              ]),
                              _vm._v(" "),
                              _c("td", [
                                _c("progress", {
                                  staticClass: "my-2 w-full",
                                  attrs: { id: "progressBar", max: "100" },
                                  domProps: { value: f.completion }
                                })
                              ])
                            ]
                          )
                        }),
                        0
                      )
                    ])
                  ]
                )
              : _vm._e()
          ]
        )
      : _vm._e(),
    _vm._v(" "),
    _vm.message
      ? _c(
          "div",
          {
            staticClass: "p-2 bg-white w-full text-sm text-gray-600 rounded",
            attrs: { id: "message" }
          },
          [_c("span", { domProps: { textContent: _vm._s(_vm.message) } })]
        )
      : _vm._e()
  ])
};
var __vue_staticRenderFns__ = [
  function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("p", { staticClass: "text-base leading-normal" }, [
      _vm._v("\n              Upload\n              "),
      _c("span", { staticClass: "hidden sm:inline" }, [
        _vm._v("From Local Computer")
      ])
    ])
  },
  function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("thead", [
      _c("tr", { staticClass: "bg-white text-left" }, [
        _c("th", { staticClass: "p-2 font-light hidden md:block" }, [
          _vm._v("#")
        ]),
        _vm._v(" "),
        _c("th", { staticClass: "p-2 font-light" }, [_vm._v("File Name")]),
        _vm._v(" "),
        _c("th", { staticClass: "p-2 font-light" }, [_vm._v("Status")]),
        _vm._v(" "),
        _c("th", { staticClass: "p-2 font-light" }, [_vm._v("Progress")])
      ])
    ])
  }
];
__vue_render__._withStripped = true;

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-962f8ec2_0", { source: "\n@media only screen and (min-width: 640px) {\n.thumbnail {\r\n    height: 300px;\r\n    overflow: hidden;\n}\n}\n@media only screen and (min-width: 768px) {\n.thumbnail {\r\n    height: 250px;\r\n    overflow: hidden;\n}\n}\n@media only screen and (min-width: 1024px) {\n.thumbnail {\r\n    height: 200px;\r\n    overflow: hidden;\n}\n}\n@media only screen and (min-width: 1280px) {\n.thumbnail {\r\n    height: 120px;\r\n    overflow: hidden;\n}\n}\n.mg-photo {\r\n  width: 100%;\r\n  height: 100%;\r\n  object-fit: cover;\n}\r\n", map: {"version":3,"sources":["C:\\laragon\\www\\vue-image-browser\\src\\vue-image-browser.vue"],"names":[],"mappings":";AAwiBA;AACA;IACA,aAAA;IACA,gBAAA;AACA;AACA;AACA;AACA;IACA,aAAA;IACA,gBAAA;AACA;AACA;AACA;AACA;IACA,aAAA;IACA,gBAAA;AACA;AACA;AACA;AACA;IACA,aAAA;IACA,gBAAA;AACA;AACA;AAEA;EACA,WAAA;EACA,YAAA;EACA,iBAAA;AACA","file":"vue-image-browser.vue","sourcesContent":["<template>\r\n  <div class=\"w-full\">\r\n    <div\r\n      v-show=\"pane === 'gallery'\"\r\n      class=\"w-full mx-auto py-4 bg-transparent my-4 flex items-center flex-no-wrap\"\r\n      id=\"top-panel\"\r\n    >\r\n      <div class=\"flex-grow flex\">\r\n        <input\r\n          class=\"p-2 w-full rounded-l-lg rounded-r-lg sm:rounded-r-none border sm:border-r-0 border-gray-300 bg-white outline-none\"\r\n          type=\"text\"\r\n          v-model=\"query\"\r\n          @keyup=\"doDelayedSearch\"\r\n          placeholder=\"search...\"\r\n        />\r\n        <div\r\n          class=\"hidden sm:flex relative pin-r rounded-r-lg border-r border-t border-b border-gray-300 bg-white py-1 px-2 items-center\"\r\n        >\r\n          <span\r\n            v-if=\"searchResult\"\r\n            class=\"py-1 px-2 bg-transparent rounded-lg text-xs whitespace-no-wrap\"\r\n            v-text=\"searchResult\"\r\n          ></span>\r\n        </div>\r\n      </div>\r\n      <div class=\"flex-none\" v-if=\"allowUpload\">\r\n        <button\r\n          class=\"text-white bg-blue-600 mx-2 px-4 py-2 rounded\"\r\n          title=\"Upload Image\"\r\n          @click=\"pane = 'upload'\"\r\n        >\r\n          Add Image\r\n        </button>\r\n      </div>\r\n    </div>\r\n\r\n    <div\r\n      v-show=\"pane === 'gallery'\"\r\n      class=\"w-full flex flex-wrap thumbnail-container overflow-y-scroll\"\r\n    >\r\n      <div\r\n        v-for=\"photo in images\"\r\n        :key=\"photo.id\"\r\n        :class=\"imagesPerRow\"\r\n        @click=\"select(photo)\"\r\n      >\r\n        <div\r\n          class=\"bg-white shadow mr-4 mb-4 cursor-pointer\"\r\n          :class=\"selectedPhoto.id === photo.id ? 'border border-blue-600' : ''\"\r\n        >\r\n          <div class=\"w-full flex items-center justify-center thumbnail\">\r\n            <img\r\n              v-bind:data-src=\"photo.url\"\r\n              :title=\"photo.name\"\r\n              class=\"mg-photo\"\r\n            />\r\n          </div>\r\n          <div\r\n            class=\"w-full flex bg-white justify-between text-gray-600 text-xs p-2\"\r\n          >\r\n            <span class=\"truncate\">{{ photo.name }}</span>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n\r\n    <div\r\n      v-if=\"pane === 'photo'\"\r\n      class=\"w-full mx-auto py-4 px-4 bg-transparent flex justify-between items-center\"\r\n    >\r\n      <button class=\"flex items-center\" @click=\"pane = 'gallery'\">\r\n        <svg\r\n          xmlns=\"http://www.w3.org/2000/svg\"\r\n          viewBox=\"0 0 20 20\"\r\n          class=\"fill-current h-8 w-8 rounded-full border border-gray-600 p-2 text-gray-600 mr-2\"\r\n        >\r\n          <polygon\r\n            points=\"3.828 9 9.899 2.929 8.485 1.515 0 10 .707 10.707 8.485 18.485 9.899 17.071 3.828 11 20 11 20 9 3.828 9\"\r\n          />\r\n        </svg>\r\n        <p class=\"text-blue-700 text-xl\">Back to Gallery</p>\r\n      </button>\r\n\r\n      <div class=\"flex items-center justify-between\">\r\n        <button\r\n          @click=\"copy\"\r\n          v-if=\"allowCopy\"\r\n          class=\"py-2 px-6 text-blue-600 hover:text-blue-800 mt-4 ml-4\"\r\n        >\r\n          {{ copyLinkText }}\r\n        </button>\r\n        <button\r\n          @click=\"choose\"\r\n          v-if=\"allowChoose\"\r\n          class=\"py-2 px-6 bg-green-500 text-white rounded shadow text-xl mt-4 ml-4\"\r\n        >\r\n          {{ chooseBtnText }}\r\n        </button>\r\n      </div>\r\n    </div>\r\n\r\n    <div v-if=\"pane === 'photo'\" class=\"w-full px-4 postcard-container\">\r\n      <div class=\"w-full postcard\">\r\n        <img\r\n          :src=\"selectedPhoto.url\"\r\n          :title=\"selectedPhoto.name\"\r\n          class=\"mx-auto shadow-lg mg-photo\"\r\n        />\r\n      </div>\r\n\r\n      <div class=\"w-full text-sm px-2 py-2 bg-white\">\r\n        <table class=\"w-full mt-4 table-auto\">\r\n          <tr class=\"border-b\" v-for=\"(pk, pv) in imageProperties\">\r\n            <td class=\"p-4 uppercase font-semibold text-gray-600\">\r\n              {{ pk.toUpperCase() }}\r\n            </td>\r\n            <td class=\"p-4 font-mono\">{{ selectedPhoto[pv] }}</td>\r\n          </tr>\r\n        </table>\r\n\r\n        <div class=\"w-full mx-auto py-4 bg-transparent my-4 flex items-center flex-no-wrap\">\r\n          <div class=\"flex-none px-3\">\r\n            <button\r\n              @click=\"deleteSelected()\"\r\n              v-if=\"allowDelete\"\r\n              class=\"text-red-500 border px-4 text-sm py-2 hover:border border-red-500 hover:text-white hover:bg-red-500 rounded cursor-pointer\"\r\n            >\r\n              Delete\r\n            </button>\r\n          </div>\r\n          <div class=\"flex-grow flex px-3\" v-if=\"allowRename\">\r\n            <input\r\n              class=\"p-2 w-full rounded-l-lg rounded-r-lg sm:rounded-r-none border sm:border-r-0 border-gray-300 bg-white outline-none\"\r\n              type=\"text\"\r\n              v-model=\"renameQuery\"\r\n            />\r\n            <div class=\"flex relative\">\r\n              <button \r\n                @click=\"renameSelected()\"\r\n                :disabled=\"isRenameDisabled\"\r\n                :class=\"isRenameDisabled ? 'opacity-50 cursor-not-allowed' : ''\"\r\n                class=\"text-blue-500 px-4 text-sm py-1 hover:border hover:border-blue-500 hover:text-white hover:bg-blue-500 rounded-r-lg border-r border-t border-b border-gray-300 cursor-pointer\">\r\n                Rename\r\n              </button>\r\n            </div>\r\n          </div>\r\n        </div>\r\n\r\n      </div>\r\n    </div>\r\n\r\n    <div\r\n      v-if=\"pane === 'upload'\"\r\n      class=\"w-full p-4 postcard-container overflow-y-scroll\"\r\n    >\r\n      <div class=\"flex justify-between\">\r\n        <button class=\"flex items-center\" @click=\"pane = 'gallery'\">\r\n          <svg\r\n            xmlns=\"http://www.w3.org/2000/svg\"\r\n            viewBox=\"0 0 20 20\"\r\n            class=\"fill-current h-8 w-8 rounded-full border p-2 text-gray-600 mr-2\"\r\n          >\r\n            <polygon\r\n              points=\"3.828 9 9.899 2.929 8.485 1.515 0 10 .707 10.707 8.485 18.485 9.899 17.071 3.828 11 20 11 20 9 3.828 9\"\r\n            />\r\n          </svg>\r\n          <p class=\"text-gray-600 font-light text-lg hidden sm:block\">\r\n            Back to Gallery\r\n          </p>\r\n        </button>\r\n        <form id=\"file-catcher\" enctype=\"multipart/form-data\" method=\"post\">\r\n          <div class=\"w-full flex bg-transparent\">\r\n            <label\r\n              class=\"flex items-center px-4 py-2 rounded-lg border border-blue-500 bg-white text-blue-500 tracking-wide cursor-pointer hover:bg-blue-500 hover:text-white\"\r\n            >\r\n              <svg\r\n                class=\"w-8 h-8 mr-4\"\r\n                fill=\"currentColor\"\r\n                xmlns=\"http://www.w3.org/2000/svg\"\r\n                viewBox=\"0 0 20 20\"\r\n              >\r\n                <path\r\n                  d=\"M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z\"\r\n                />\r\n              </svg>\r\n              <p class=\"text-base leading-normal\">\r\n                Upload\r\n                <span class=\"hidden sm:inline\">From Local Computer</span>\r\n              </p>\r\n              <input\r\n                id=\"files\"\r\n                type=\"file\"\r\n                name=\"files\"\r\n                multiple\r\n                class=\"hidden\"\r\n                @change=\"uploadFiles\"\r\n              />\r\n            </label>\r\n          </div>\r\n        </form>\r\n      </div>\r\n      <div\r\n        id=\"file-list-display\"\r\n        class=\"w-full my-4\"\r\n        v-if=\"uploadableFiles.length > 0\"\r\n      >\r\n        <table class=\"w-full my-2 text-sm\">\r\n          <thead>\r\n            <tr class=\"bg-white text-left\">\r\n              <th class=\"p-2 font-light hidden md:block\">#</th>\r\n              <th class=\"p-2 font-light\">File Name</th>\r\n              <th class=\"p-2 font-light\">Status</th>\r\n              <th class=\"p-2 font-light\">Progress</th>\r\n            </tr>\r\n          </thead>\r\n          <tbody>\r\n            <tr\r\n              class=\"p-2 border-b\"\r\n              v-for=\"(f, index) in uploadableFiles\"\r\n              v-bind:key=\"index\"\r\n            >\r\n              <td v-text=\"index + 1\" class=\"text-left p-2 hidden md:block\"></td>\r\n              <td class=\"text-left p-2\" v-text=\"f.name\"></td>\r\n              <td>\r\n                <span v-text=\"f.status\"></span>\r\n              </td>\r\n              <td>\r\n                <progress\r\n                  id=\"progressBar\"\r\n                  :value=\"f.completion\"\r\n                  max=\"100\"\r\n                  class=\"my-2 w-full\"\r\n                ></progress>\r\n              </td>\r\n            </tr>\r\n          </tbody>\r\n        </table>\r\n      </div>\r\n    </div>\r\n\r\n    <div\r\n      class=\"p-2 bg-white w-full text-sm text-gray-600 rounded\"\r\n      id=\"message\"\r\n      v-if=\"message\"\r\n    >\r\n      <span v-text=\"message\"></span>\r\n    </div>\r\n  </div>\r\n</template>\r\n\r\n<script>\r\nexport default {\r\n  name: 'vue-image-browser',\r\n\r\n  props: {\r\n    images: {\r\n      type: Array,\r\n      default: () => [],\r\n    },\r\n\r\n    imageProperties: {\r\n      type: Object,\r\n    },\r\n\r\n    allowUpload: {\r\n      type: Boolean,\r\n      default: false,\r\n    },\r\n\r\n    saveUrl: {\r\n      type: String,\r\n      default: '/api/photos',\r\n    },\r\n\r\n    saveRequestHeaders: {\r\n      type: Object,\r\n      default: () => {},\r\n    },\r\n\r\n    searchDelay: {\r\n      type: Number,\r\n      default: 500,\r\n    },\r\n\r\n    allowDelete: {\r\n      type: Boolean,\r\n      default: false,\r\n    },\r\n\r\n    allowRename: {\r\n      type: Boolean,\r\n      default: false,\r\n    },\r\n\r\n    allowPhotoPane: {\r\n      type: Boolean,\r\n      default: false,\r\n    },\r\n\r\n    allowChoose: {\r\n      type: Boolean,\r\n      default: false,\r\n    },\r\n\r\n    allowCopy: {\r\n      type: Boolean,\r\n      default: true,\r\n    },\r\n\r\n    captionable: {\r\n      type: Boolean,\r\n      default: false,\r\n    },\r\n\r\n    enableLazyLoad: {\r\n      type: Boolean,\r\n      default: true,\r\n    },\r\n\r\n    maxImagesPerRow: {\r\n      type: Number,\r\n      default: 5,\r\n    },\r\n  },\r\n\r\n  data: function () {\r\n    return {\r\n      message: null,\r\n      query: '',\r\n      renameQuery: '',\r\n      searchResult: null,\r\n      pane: 'gallery',\r\n      selectedPhoto: {},\r\n      uploadableFiles: [],\r\n      copyLinkText: 'Copy Link',\r\n      chooseBtnText: 'Choose',\r\n    }\r\n  },\r\n\r\n  created() {\r\n    this.$nextTick(function () {\r\n      if (this.enableLazyLoad) {\r\n        this.enableLazyLoading()\r\n      }\r\n    })\r\n  },\r\n\r\n  updated: function () {\r\n    this.$nextTick(function () {\r\n      if (this.enableLazyLoad) {\r\n        this.enableLazyLoading()\r\n      }\r\n    })\r\n  },\r\n\r\n  computed: {\r\n    imagesPerRow() {\r\n      let xs = parseInt(this.maxImagesPerRow * (1 / 4)),\r\n        md = parseInt(this.maxImagesPerRow * (2 / 4)),\r\n        lg = parseInt(this.maxImagesPerRow * (3 / 4)),\r\n        xl = parseInt(this.maxImagesPerRow * (4 / 4))\r\n\r\n      return (\r\n        'w-full w-1/' + xs + ' md:w-1/' + md + ' lg:w-1/' + lg + ' xl:w-1/' + xl\r\n      )\r\n    },\r\n\r\n    isRenameDisabled() {\r\n      return this.selectedPhoto.name === this.renameQuery\r\n    },\r\n  },\r\n\r\n  methods: {\r\n    select(photo) {\r\n      this.selectedPhoto = photo\r\n\r\n      this.renameQuery = photo.name\r\n\r\n      this.allowPhotoPane && (this.pane = 'photo')\r\n\r\n      this.captionable && (this.selectedPhoto['caption'] = this.getCaption())\r\n\r\n      this.$emit('selected', this.selectedPhoto)\r\n    },\r\n\r\n    choose: function () {\r\n      this.captionable && (this.selectedPhoto['caption'] = this.getCaption())\r\n\r\n      this.$emit('chosen', this.selectedPhoto)\r\n\r\n      this.pane = 'gallery'\r\n    },\r\n\r\n    copy() {\r\n      let p = this\r\n\r\n      if (navigator.clipboard) {\r\n        navigator.clipboard.writeText(this.selectedPhoto.url).then(() => {\r\n          p.copyLinkText = 'Link Copied!'\r\n        })\r\n      }\r\n    },\r\n\r\n    getCaption() {\r\n      // remove file name extensions\r\n      let caption = this.selectedPhoto.name.replace(/\\.[^/.]+$/, '')\r\n\r\n      // remove special characters with space\r\n      caption = caption.replace(/[^\\w\\s]/gi, ' ')\r\n\r\n      // uppercase first letter of each word\r\n      caption = caption\r\n        .toLowerCase()\r\n        .split(' ')\r\n        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))\r\n        .join(' ')\r\n\r\n      return prompt('Enter an caption for this image', caption)\r\n    },\r\n\r\n    uploadFiles: function () {\r\n      let files = document.getElementById('files').files,\r\n        p = this\r\n\r\n      for (let i = 0; i < files.length; i++) {\r\n        let upf = {\r\n          name: files[i].name,\r\n          formdata: new FormData(),\r\n          ajax: new XMLHttpRequest(),\r\n          status: 'Not Started',\r\n          completion: 0,\r\n        }\r\n\r\n        upf.formdata.append('image', files[i])\r\n        upf.formdata.append('name', files[i].name)\r\n\r\n        upf.ajax.upload.onprogress = function (e) {\r\n          upf.status = 'Uploaded ' + Math.round(e.loaded / 1000) + ' KB...'\r\n          upf.completion = Math.round((e.loaded / e.total) * 100)\r\n        }\r\n        upf.ajax.upload.onload = function (e) {\r\n          upf.status = 'Complete'\r\n          upf.completion = 100\r\n        }\r\n        upf.ajax.upload.onerror = function (e) {\r\n          upf.status = 'Error uploading the file'\r\n          upf.completion = 0\r\n        }\r\n        // ajax.upload.addEventListener('abort', abortHandler, false);\r\n\r\n        upf.ajax.open('POST', p.saveUrl)\r\n\r\n        let header_keys = Object.keys(p.saveRequestHeaders)\r\n        for (let i = 0; i < header_keys.length; i++) {\r\n          let header = header_keys[i]\r\n          let val = p.saveRequestHeaders[header]\r\n          upf.ajax.setRequestHeader(header, val)\r\n        }\r\n\r\n        upf.ajax.onreadystatechange = function () {\r\n          if (upf.ajax.readyState === 4 && upf.ajax.status === 200) {\r\n            let response = upf.ajax.responseText\r\n            if (response) {\r\n              try {\r\n                let media = JSON.parse(response)\r\n                p.$emit('saved', media)\r\n              } catch (e) {\r\n                alert(e)\r\n              }\r\n            }\r\n          }\r\n          if (upf.ajax.readyState === 4 && upf.ajax.status != 200) {\r\n            upf.status =\r\n              'Error uploading the file (Status = ' + upf.ajax.status + ')'\r\n            upf.completion = 0\r\n          }\r\n        }\r\n        upf.ajax.send(upf.formdata)\r\n        this.uploadableFiles.push(upf)\r\n      }\r\n    },\r\n\r\n    deleteSelected() {\r\n      this.$emit('deleted', this.selectedPhoto)\r\n      this.pane = 'gallery'\r\n    },\r\n\r\n    renameSelected() {\r\n      if (this.renameQuery.length <= 0)\r\n        return;\r\n\r\n      this.$emit('renamed', this.selectedPhoto, this.renameQuery)\r\n    },\r\n\r\n    doDelayedSearch() {\r\n      let p = this\r\n\r\n      if (this.timer) {\r\n        clearTimeout(this.timer)\r\n        this.timer = null\r\n      }\r\n\r\n      if (p.query.length > 0) p.searchResult = 'Searching...'\r\n      else p.searchResult = ''\r\n\r\n      this.timer = setTimeout(() => {\r\n        p.$emit('searched', p.query)\r\n      }, this.searchDelay)\r\n    },\r\n\r\n    // This is an experimental function that enables\r\n    // lazy-loading.\r\n    enableLazyLoading() {\r\n      let images = document.querySelectorAll('.mg-photo')\r\n\r\n      const config = {\r\n        root: null,\r\n        rootMargin: '0px 0px 50px 0px',\r\n      }\r\n\r\n      // check if intersection observer is supported via browser\r\n      if (!('IntersectionObserver' in window)) {\r\n        // if not, just load all immediately\r\n        Array.from(images).forEach(function (image) {\r\n          console.log('IntersectionObserver unsupported loading')\r\n          if (!image.src) image.src = image.dataset.src\r\n        })\r\n      } else {\r\n        let observer = new IntersectionObserver(function (entries) {\r\n          entries.forEach((image) => {\r\n            // Are we in viewport?\r\n            if (image.isIntersecting) {\r\n              // console.log('Loading: ' + image.target.dataset.src)\r\n              // console.log(image.target.src)\r\n              image.target.src = image.target.dataset.src\r\n              observer.unobserve(image.target)\r\n            }\r\n          })\r\n        }, config)\r\n\r\n        images.forEach((image) => {\r\n          if (!image.src) {\r\n            observer.observe(image)\r\n          }\r\n        })\r\n      }\r\n    },\r\n  },\r\n}\r\n</script>\r\n\r\n<style>\r\n@media only screen and (min-width: 640px) {\r\n  .thumbnail {\r\n    height: 300px;\r\n    overflow: hidden;\r\n  }\r\n}\r\n@media only screen and (min-width: 768px) {\r\n  .thumbnail {\r\n    height: 250px;\r\n    overflow: hidden;\r\n  }\r\n}\r\n@media only screen and (min-width: 1024px) {\r\n  .thumbnail {\r\n    height: 200px;\r\n    overflow: hidden;\r\n  }\r\n}\r\n@media only screen and (min-width: 1280px) {\r\n  .thumbnail {\r\n    height: 120px;\r\n    overflow: hidden;\r\n  }\r\n}\r\n\r\n.mg-photo {\r\n  width: 100%;\r\n  height: 100%;\r\n  object-fit: cover;\r\n}\r\n</style>\r\n"]}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = undefined;
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

// Import vue component

// Declare install function executed by Vue.use()
function install(Vue) {
	if (install.installed) { return; }
	install.installed = true;
	Vue.component('VueImageBrowser', __vue_component__);
}

// Create module definition for Vue.use()
var plugin = {
	install: install,
};

// Auto-install when vue is found (eg. in browser via <script> tag)
var GlobalVue = null;
if (typeof window !== 'undefined') {
	GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
	GlobalVue = global.Vue;
}
if (GlobalVue) {
	GlobalVue.use(plugin);
}

export default __vue_component__;
export { install };
