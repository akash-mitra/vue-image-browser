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
            source: {
                type: String,
                default: '/api/photos'
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
                this.getFromServer();
        },

        updated: function () {
                this.enableLazyLoad();
        },

        methods: {
                doDelayedSearch: function doDelayedSearch() {

                    var p = this;

                    if (this.timer) {
                        clearTimeout(this.timer);
                        this.timer = null;
                    }

                    p.searchResult = 'Searching...';

                    this.timer = setTimeout(function () {

                        p.getFromServer(p.query);
                    }, 800);

                },

                select: function select(photo) {
                        this.pane = 'photo';
                        this.selectedPhoto = photo;
                },

                choose: function () {

                        // remove file name extensions
                        var caption = this.selectedPhoto.name.replace(/\.[^/.]+$/, "");

                        // remove special characters with space
                        caption = caption.replace(/[^\w\s]/gi, ' ');

                        // uppercase first letter of each word
                        caption = caption.toLowerCase()
                                .split(' ')
                                .map(function (s) { return s.charAt(0).toUpperCase() + s.substring(1); })
                                .join(' ');

                        var captionChosen = prompt('Enter an caption for this image', caption);
                        //TODO we should remove any double quote in captionChosen
                        this.selectedPhoto['caption'] = captionChosen;

                        this.$emit('selected', this.selectedPhoto);
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
                                        completion: 0
                                };

                                upf.formdata.append('image', files[i]);
                                upf.formdata.append('name', files[i].name);
                                // upf.formdata.append("Content-Type", files[i].type);

                                upf.ajax.upload.onprogress = function (e) {
                                        upf.status = 'Uploaded ' + Math.round(e.loaded/1000) + ' KB...';
                                        upf.completion = Math.round((e.loaded/e.total)*100);
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

                                upf.ajax.open('POST', '/api/media');
                                upf.ajax.setRequestHeader("X-CSRF-Token", document.head.querySelector('meta[name="csrf-token"]').content);
                                upf.ajax.onreadystatechange = function () {
                                    if (upf.ajax.readyState === 4 && upf.ajax.status === 200) {
                                        var response = upf.ajax.responseText;
                                        if(response) {
                                            try {
                                                var media = JSON.parse(response);
                                                p.photos.push(media.file);
                                            } catch(e) {
                                                alert(e);
                                            }
                                        }
                                    }
                                    if (upf.ajax.readyState === 4 && upf.ajax.status != 200) {
                                        upf.status = 'Error uploading the file (Status = ' + upf.ajax.status + ')';
                                        upf.completion = 0;
                                    }
                                };
                                upf.ajax.send(upf.formdata);
                                this$1.uploadableFiles.push(upf);
                        };

                        for(var i = 0; i < files.length; i++) loop( i );
                },

                // Gets media data from the server. If a query string is
                // provided then only returns the data that fulfill
                // the search conditions in query string.
                getFromServer: function (query, callback) {
                        var p = this;
                        var url = this.source + ((typeof query != 'undefined' && query != null) ? '?query=' + encodeURIComponent(query):'');
                        axios.get(url)
                        .then(function (response) {
                                p.photos = response.data.data;
                                p.message = null;
                                p.searchResult = response.data.total + ' image(s)';
                                if (typeof callback != 'undefined') { callback.call(); }
                        })
                        .catch(function (error) {
                                p.message = 'Request failed with ' + error.response.status + ': ' + error.response.statusText;
                                if (error.response.status == '403') { // special helpful message for loggedout situations
                                        p.message += '. Make sure you are logged in or refresh the page.';
                                }
                        });
                },


                deleteSelected: function deleteSelected() {

                    // let q = this

                    this.$emit('deleted', this.selectedPhoto);

                    // util.confirm("Delete photo?",  "This will permanently delete this media. This action is unrecoverable.", function (){

                    //             let p = q
                    //             axios.delete('/api/media/' + q.selectedPhoto.id)
                    //             .then(function(response) {
                    //                     util.notifySuccess('Photo deleted')

                    //                     let l = p.photos.length
                    //                     for (let i = 0; i < l; i++) {
                    //                             if (p.photos[i].id === p.selectedPhoto.id) {

                    //                                     p.photos.splice(i, 1)
                    //                                     break
                    //                             }
                    //                     }
                    //                     p.pane = 'gallery'
                    //             })
                    // })
                },


                // This is an experimental function that enables
                // lazy-loading.
                enableLazyLoad: function () {
                        var images = document.querySelectorAll('.mg-photo');

                        var config = {
                                root: document.querySelector('.top-panel'),
                                // If the image gets within 100px in the Y axis, start the download.
                                rootMargin: '0px 0px 50px 0px'
                        };

                        // check if intersection observer is supported via browser
                        if (!('IntersectionObserver' in window) || this.lazyload === false) {
                                // if not, just load all immediately
                                Array.from(images).forEach(function(image) {
                                        console.log('IntersectionObserver unsupported loading');
                                        if(! image.src) { image.src = image.dataset.src; }
                                });
                        } else {
                                // The observer is supported
                                var observer = new IntersectionObserver(function (entries) {
                                        // Loop through the entries
                                        entries.forEach(function (image) {
                                                // Are we in viewport?
                                                if (image.isIntersecting) {
                                                        // Stop watching and load the image
                                                        // console.log('Loading: ' + image.target.dataset.src)
                                                        observer.unobserve(image.target);
                                                        // console.log(image.target.src)
                                                        image.target.src = image.target.dataset.src;
                                                }
                                        });
                                }, config);

                                // start observing...
                                images.forEach(function (image) {
                                        if(! image.src) {
                                            observer.observe(image);
                                        }
                                });
                        }
                },
        }
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
            expression: "pane==='gallery'"
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
              "p-2 w-full rounded-l-lg rounded-r-lg sm:rounded-r-none border-l-2 border-r-2 sm:border-r-0 border-t-2 border-b-2 border-gray-300 bg-white",
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
                "hidden sm:flex relative pin-r rounded-r-lg border-r-2 border-t-2 border-b-2 border-gray-300 bg-white py-1 px-2  items-center"
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
        _c("div", { staticClass: "flex-none" }, [
          _c(
            "button",
            {
              staticClass: "text-blue-600 mx-2 px-4",
              attrs: { title: "Upload Image" },
              on: {
                click: function($event) {
                  _vm.pane = "upload";
                }
              }
            },
            [
              _vm._v(
                "\n                            Upload\n                    "
              )
            ]
          )
        ])
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
            expression: "pane==='gallery'"
          }
        ],
        staticClass:
          "w-full flex flex-wrap thumbnail-container overflow-y-scroll"
      },
      _vm._l(_vm.photos, function(photo) {
        return _c(
          "div",
          {
            key: photo.id,
            staticClass: "w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5",
            on: {
              click: function($event) {
                return _vm.select(photo)
              }
            }
          },
          [
            _c(
              "div",
              { staticClass: "bg-white shadow mr-4 mb-4 cursor-pointer" },
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
                    _c("span", {
                      domProps: {
                        textContent: _vm._s(photo.storage.toUpperCase())
                      }
                    }),
                    _vm._v(" "),
                    _c("span", [_vm._v(_vm._s(photo.size) + " KB")])
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
                  _vm._v("All Photos")
                ])
              ]
            ),
            _vm._v(" "),
            _vm.deletable
              ? _c(
                  "span",
                  {
                    staticClass:
                      "text-red-500 mr-4 px-2 text-sm py-1 hover:border border-red-500 hover:text-white hover:bg-red-500 rounded cursor-pointer",
                    on: {
                      click: function($event) {
                        return _vm.deleteSelected()
                      }
                    }
                  },
                  [_vm._v("Delete ")]
                )
              : _vm._e()
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
            _vm.selectable
              ? _c(
                  "button",
                  {
                    staticClass:
                      "py-2 px-6 bg-green-500 text-white rounded shadow text-xl mt-4 ml-4",
                    on: { click: _vm.choose }
                  },
                  [_vm._v("Select")]
                )
              : _vm._e(),
            _vm._v(" "),
            _c("table", { staticClass: "w-full mt-4 table-auto" }, [
              _c("tr", { staticClass: "border-b" }, [
                _c(
                  "td",
                  { staticClass: "p-4 uppercase font-semibold text-gray-600" },
                  [_vm._v("Media ID")]
                ),
                _vm._v(" "),
                _c("td", { staticClass: "p-4 font-mono" }, [
                  _vm._v(_vm._s(_vm.selectedPhoto.id))
                ])
              ]),
              _vm._v(" "),
              _c("tr", { staticClass: "border-b" }, [
                _c(
                  "td",
                  { staticClass: "p-4 uppercase font-semibold text-gray-600" },
                  [_vm._v("Original Media Name")]
                ),
                _vm._v(" "),
                _c("td", { staticClass: "p-4 font-mono" }, [
                  _vm._v(_vm._s(_vm.selectedPhoto.name))
                ])
              ]),
              _vm._v(" "),
              _c("tr", { staticClass: "border-b" }, [
                _c(
                  "td",
                  { staticClass: "p-4 uppercase font-semibold text-gray-600" },
                  [_vm._v("Media Type")]
                ),
                _vm._v(" "),
                _c("td", { staticClass: "p-4 font-mono" }, [
                  _vm._v(_vm._s(_vm.selectedPhoto.type))
                ])
              ]),
              _vm._v(" "),
              _c("tr", { staticClass: "border-b" }, [
                _c(
                  "td",
                  { staticClass: "p-4 uppercase font-semibold text-gray-600" },
                  [_vm._v("File Size")]
                ),
                _vm._v(" "),
                _c("td", { staticClass: "p-4 font-mono" }, [
                  _vm._v(_vm._s(_vm.selectedPhoto.size) + " KB")
                ])
              ]),
              _vm._v(" "),
              _c("tr", { staticClass: "border-b" }, [
                _c(
                  "td",
                  { staticClass: "p-4 uppercase font-semibold text-gray-600" },
                  [_vm._v("File Path")]
                ),
                _vm._v(" "),
                _c("td", { staticClass: "p-4 font-mono" }, [
                  _vm._v(_vm._s(_vm.selectedPhoto.path))
                ])
              ]),
              _vm._v(" "),
              _c("tr", { staticClass: "border-b" }, [
                _c(
                  "td",
                  { staticClass: "p-4 uppercase font-semibold text-gray-600" },
                  [_vm._v("Media URL")]
                ),
                _vm._v(" "),
                _c("td", { staticClass: "p-4 font-mono" }, [
                  _vm._v(_vm._s(_vm.selectedPhoto.url))
                ])
              ]),
              _vm._v(" "),
              _c("tr", { staticClass: "border-b" }, [
                _c(
                  "td",
                  { staticClass: "p-4 uppercase font-semibold text-gray-600" },
                  [_vm._v("Storage Type")]
                ),
                _vm._v(" "),
                _c("td", { staticClass: "p-4 font-mono" }, [
                  _vm._v(_vm._s(_vm.selectedPhoto.storage))
                ])
              ]),
              _vm._v(" "),
              _c("tr", { staticClass: "border-b" }, [
                _c(
                  "td",
                  { staticClass: "p-4 uppercase font-semibold text-gray-600" },
                  [_vm._v("Created")]
                ),
                _vm._v(" "),
                _c("td", { staticClass: "p-4 font-mono" }, [
                  _vm._v(_vm._s(_vm.selectedPhoto.created_ago))
                ])
              ]),
              _vm._v(" "),
              _c("tr", {}, [
                _c(
                  "td",
                  { staticClass: "p-4 uppercase font-semibold text-gray-600" },
                  [_vm._v("Uploader ID")]
                ),
                _vm._v(" "),
                _c("td", { staticClass: "p-4 font-mono" }, [
                  _vm._v(_vm._s(_vm.selectedPhoto.user_id))
                ])
              ])
            ])
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
                    [_vm._v("Back to Gallery")]
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
    return _c("p", { staticClass: "text-base leading-normal " }, [
      _vm._v("Upload "),
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
    inject("data-v-ec11a9cc_0", { source: "\n.thumbnail-container {\n}\n.thumbnail {\n    height: 100px;\n    overflow: hidden;\n}\n.postcard-container {\n}\n.postcard  {\n}\n.mg-photo {\n    width: 100%;\n    height: 100%;\n    object-fit: cover;\n}\n\n", map: {"version":3,"sources":["/Users/akash/code/vue-image-browser/src/vue-image-browser.vue"],"names":[],"mappings":";AAoYA;AAEA;AACA;IACA,aAAA;IACA,gBAAA;AACA;AAEA;AAGA;AAEA;AAEA;AAEA;IACA,WAAA;IACA,YAAA;IACA,iBAAA;AACA","file":"vue-image-browser.vue","sourcesContent":["<template>\n\n        <div class=\"w-full\">\n\n                <div v-show=\"pane==='gallery'\" class=\"w-full mx-auto py-4 bg-transparent my-4 flex items-center flex-no-wrap\" id=\"top-panel\">\n                        <div class=\"flex-grow flex\">\n                                <input class=\"p-2 w-full rounded-l-lg rounded-r-lg sm:rounded-r-none border-l-2 border-r-2 sm:border-r-0 border-t-2 border-b-2 border-gray-300 bg-white\"\n                                        type=\"text\"\n                                        v-model=\"query\"\n                                        @keyup=\"doDelayedSearch\"\n                                        placeholder=\"search...\"/>\n                                <div class=\"hidden sm:flex relative pin-r rounded-r-lg border-r-2 border-t-2 border-b-2 border-gray-300 bg-white py-1 px-2  items-center\">\n                                        <span v-if=\"searchResult\" class=\"py-1 px-2 bg-transparent rounded-lg text-xs whitespace-no-wrap\" v-text=\"searchResult\"></span>\n                                </div>\n                        </div>\n                        <div class=\"flex-none\">\n                            <button class=\"text-blue-600 mx-2 px-4\" title=\"Upload Image\" @click=\"pane='upload'\">\n                                    Upload\n                            </button>\n                        </div>\n                </div>\n\n                <div v-show=\"pane==='gallery'\" class=\"w-full flex flex-wrap thumbnail-container overflow-y-scroll\">\n                        <div v-for=\"photo in photos\" :key=\"photo.id\" class=\"w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5\" @click=\"select(photo)\">\n\n                                <div class=\"bg-white shadow mr-4 mb-4 cursor-pointer\">\n                                        <div class=\"w-full flex items-center justify-center thumbnail\">\n                                                <img v-bind:data-src=\"photo.url\" :title=\"photo.name\" class=\"mg-photo\"/>\n                                        </div>\n                                        <div class=\"w-full flex bg-white justify-between text-gray-600 text-xs p-2\">\n                                                <span v-text=\"photo.storage.toUpperCase()\"></span>\n                                                <span>{{ photo.size }} KB</span>\n                                        </div>\n                                </div>\n                        </div>\n                </div>\n\n\n                <div v-if=\"pane==='photo'\" class=\"w-full mx-auto py-4 px-4 bg-transparent flex justify-between items-center\">\n                        <button class=\"flex items-center\" @click=\"pane='gallery'\">\n                                <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 20\" class=\"fill-current h-8 w-8 rounded-full border border-gray-600 p-2 text-gray-600 mr-2\"><polygon points=\"3.828 9 9.899 2.929 8.485 1.515 0 10 .707 10.707 8.485 18.485 9.899 17.071 3.828 11 20 11 20 9 3.828 9\"/></svg>\n                                <p class=\"text-blue-700 text-xl\">All Photos</p>\n                        </button>\n                        <span @click=\"deleteSelected()\" v-if=\"deletable\" class=\"text-red-500 mr-4 px-2 text-sm py-1 hover:border border-red-500 hover:text-white hover:bg-red-500 rounded cursor-pointer\">Delete </span>\n                </div>\n\n                <div v-if=\"pane==='photo'\" class=\"w-full px-4 postcard-container\">\n\n                    <div class=\"w-full postcard\">\n                            <img :src=\"selectedPhoto.url\" :title=\"selectedPhoto.name\" class=\"mx-auto shadow-lg mg-photo\"/>\n                    </div>\n\n                    <div class=\"w-full text-sm px-2 py-2 bg-white\">\n\n                        <button v-if=\"selectable\" class=\"py-2 px-6 bg-green-500 text-white rounded shadow text-xl mt-4 ml-4\" @click=\"choose\">Select</button>\n\n                        <table class=\"w-full mt-4 table-auto\">\n                            <tr class=\"border-b\">\n                                <td class=\"p-4 uppercase font-semibold text-gray-600\">Media ID</td>\n                                <td class=\"p-4 font-mono\">{{selectedPhoto.id}}</td>\n                            </tr>\n                            <tr class=\"border-b\">\n                                <td class=\"p-4 uppercase font-semibold text-gray-600\">Original Media Name</td>\n                                <td class=\"p-4 font-mono\">{{selectedPhoto.name}}</td>\n                            </tr>\n                            <tr class=\"border-b\">\n                                <td class=\"p-4 uppercase font-semibold text-gray-600\">Media Type</td>\n                                <td class=\"p-4 font-mono\">{{selectedPhoto.type}}</td>\n                            </tr>\n                            <tr class=\"border-b\">\n                                <td class=\"p-4 uppercase font-semibold text-gray-600\">File Size</td>\n                                <td class=\"p-4 font-mono\">{{selectedPhoto.size}} KB</td>\n                            </tr>\n                            <tr class=\"border-b\">\n                                <td class=\"p-4 uppercase font-semibold text-gray-600\">File Path</td>\n                                <td class=\"p-4 font-mono\">{{selectedPhoto.path}}</td>\n                            </tr>\n                            <tr class=\"border-b\">\n                                <td class=\"p-4 uppercase font-semibold text-gray-600\">Media URL</td>\n                                <td class=\"p-4 font-mono\">{{selectedPhoto.url}}</td>\n                            </tr>\n                            <tr class=\"border-b\">\n                                <td class=\"p-4 uppercase font-semibold text-gray-600\">Storage Type</td>\n                                <td class=\"p-4 font-mono\">{{selectedPhoto.storage}}</td>\n                            </tr>\n                            <tr class=\"border-b\">\n                                <td class=\"p-4 uppercase font-semibold text-gray-600\">Created</td>\n                                <td class=\"p-4 font-mono\">{{selectedPhoto.created_ago}}</td>\n                            </tr>\n                            <tr class=\"\">\n                                <td class=\"p-4 uppercase font-semibold text-gray-600\">Uploader ID</td>\n                                <td class=\"p-4 font-mono\">{{selectedPhoto.user_id}}</td>\n                            </tr>\n                        </table>\n\n                    </div>\n\n                </div>\n\n                <div v-if=\"pane==='upload'\" class=\"w-full p-4 postcard-container overflow-y-scroll\">\n\n                        <div class=\"flex justify-between\">\n                                <button class=\"flex items-center\" @click=\"pane='gallery'\">\n                                        <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 20\" class=\"fill-current h-8 w-8 rounded-full border p-2 text-gray-600 mr-2\"><polygon points=\"3.828 9 9.899 2.929 8.485 1.515 0 10 .707 10.707 8.485 18.485 9.899 17.071 3.828 11 20 11 20 9 3.828 9\"/></svg>\n                                        <p class=\"text-gray-600 font-light text-lg hidden sm:block\">Back to Gallery</p>\n                                </button>\n                                <form id='file-catcher' enctype=\"multipart/form-data\" method=\"post\">\n                                        <div class=\"w-full flex bg-transparent\">\n                                                <label class=\"flex items-center px-4 py-2 rounded-lg border border-blue-500 bg-white text-blue-500 tracking-wide cursor-pointer hover:bg-blue-500 hover:text-white\">\n                                                        <svg class=\"w-8 h-8 mr-4\" fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 20\">\n                                                                <path d=\"M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z\" />\n                                                        </svg>\n                                                        <p class=\"text-base leading-normal \">Upload <span class=\"hidden sm:inline\">From Local Computer</span></p>\n                                                        <input id='files' type='file' name=\"files\" multiple class=\"hidden\" @change=\"uploadFiles\" />\n                                                </label>\n                                        </div>\n                                </form>\n                        </div>\n                        <div id='file-list-display' class=\"w-full my-4\" v-if=\"uploadableFiles.length > 0\">\n                                <table class=\"w-full my-2 text-sm\">\n                                        <thead>\n                                                <tr class=\"bg-white text-left\">\n                                                        <th class=\"p-2 font-light hidden md:block\">#</th>\n                                                        <th class=\"p-2 font-light\">File Name</th>\n                                                        <th class=\"p-2 font-light\">Status</th>\n                                                        <th class=\"p-2 font-light\">Progress</th>\n                                                </tr>\n                                        </thead>\n                                        <tbody>\n                                                <tr class=\"p-2 border-b\" v-for=\"(f, index) in uploadableFiles\" v-bind:key=\"index\">\n                                                        <td v-text=\"index+1\" class=\"text-left p-2 hidden md:block\"></td>\n                                                        <td class=\"text-left p-2\" v-text=\"f.name\"></td>\n                                                        <td>\n                                                                <span v-text=\"f.status\"></span>\n                                                        </td>\n                                                        <td>\n                                                                <progress id=\"progressBar\" :value=\"f.completion\" max=\"100\" class=\"my-2 w-full\"></progress>\n                                                        </td>\n                                                </tr>\n                                        </tbody>\n                                </table>\n                        </div>\n                </div>\n\n                <div class=\"p-2 bg-white w-full text-sm text-gray-600 rounded\" id=\"message\" v-if=\"message\">\n                        <span v-text=\"message\"></span>\n                </div>\n        </div>\n</template>\n\n<script>\nexport default {\n\n        name: 'vue-image-browser',\n\n        props: {\n            source: {\n                type: String,\n                default: '/api/photos'\n            },\n\n            deletable: {\n                    type: Boolean,\n                    default: false\n            },\n            selectable: {\n                    type: Boolean,\n                    default: false\n            },\n            lazyload: {\n                    type: Boolean,\n                    default: true\n            }\n        },\n        data: function () {\n                return {\n                        photos: [],\n                        message: 'Loading Images...',\n                        query: '',\n                        searchResult: null,\n                        pane: 'gallery',\n                        selectedPhoto: {},\n                        uploadableFiles: [],\n                }\n        },\n        created: function () {\n                this.getFromServer()\n        },\n\n        updated: function () {\n                this.enableLazyLoad()\n        },\n\n        methods: {\n                doDelayedSearch() {\n\n                    let p = this\n\n                    if (this.timer) {\n                        clearTimeout(this.timer);\n                        this.timer = null;\n                    }\n\n                    p.searchResult = 'Searching...'\n\n                    this.timer = setTimeout(() => {\n\n                        p.getFromServer(p.query)\n                    }, 800)\n\n                },\n\n                select(photo) {\n                        this.pane = 'photo'\n                        this.selectedPhoto = photo\n                },\n\n                choose: function () {\n\n                        // remove file name extensions\n                        let caption = this.selectedPhoto.name.replace(/\\.[^/.]+$/, \"\")\n\n                        // remove special characters with space\n                        caption = caption.replace(/[^\\w\\s]/gi, ' ')\n\n                        // uppercase first letter of each word\n                        caption = caption.toLowerCase()\n                                .split(' ')\n                                .map((s) => s.charAt(0).toUpperCase() + s.substring(1))\n                                .join(' ');\n\n                        var captionChosen = prompt('Enter an caption for this image', caption)\n                        //TODO we should remove any double quote in captionChosen\n                        this.selectedPhoto['caption'] = captionChosen\n\n                        this.$emit('selected', this.selectedPhoto)\n                },\n\n                uploadFiles: function () {\n                        let files = document.getElementById('files').files,\n                            p = this;\n                        for(let i = 0; i < files.length; i++) {\n                                let upf = {\n                                        name: files[i].name,\n                                        formdata: new FormData(),\n                                        ajax: new XMLHttpRequest(),\n                                        status: 'Not Started',\n                                        completion: 0\n                                };\n\n                                upf.formdata.append('image', files[i])\n                                upf.formdata.append('name', files[i].name)\n                                // upf.formdata.append(\"Content-Type\", files[i].type);\n\n                                upf.ajax.upload.onprogress = function (e) {\n                                        upf.status = 'Uploaded ' + Math.round(e.loaded/1000) + ' KB...'\n                                        upf.completion = Math.round((e.loaded/e.total)*100)\n                                }\n                                upf.ajax.upload.onload = function (e) {\n                                        upf.status = 'Complete'\n                                        upf.completion = 100\n                                }\n                                upf.ajax.upload.onerror = function (e) {\n                                        upf.status = 'Error uploading the file'\n                                        upf.completion = 0\n                                }\n                                // ajax.upload.addEventListener('abort', abortHandler, false);\n\n                                upf.ajax.open('POST', '/api/media')\n                                upf.ajax.setRequestHeader(\"X-CSRF-Token\", document.head.querySelector('meta[name=\"csrf-token\"]').content)\n                                upf.ajax.onreadystatechange = function () {\n                                    if (upf.ajax.readyState === 4 && upf.ajax.status === 200) {\n                                        let response = upf.ajax.responseText\n                                        if(response) {\n                                            try {\n                                                let media = JSON.parse(response);\n                                                p.photos.push(media.file)\n                                            } catch(e) {\n                                                alert(e);\n                                            }\n                                        }\n                                    }\n                                    if (upf.ajax.readyState === 4 && upf.ajax.status != 200) {\n                                        upf.status = 'Error uploading the file (Status = ' + upf.ajax.status + ')'\n                                        upf.completion = 0\n                                    }\n                                };\n                                upf.ajax.send(upf.formdata)\n                                this.uploadableFiles.push(upf)\n                        }\n                },\n\n                // Gets media data from the server. If a query string is\n                // provided then only returns the data that fulfill\n                // the search conditions in query string.\n                getFromServer: function (query, callback) {\n                        const p = this\n                        let url = this.source + ((typeof query != 'undefined' && query != null) ? '?query=' + encodeURIComponent(query):'')\n                        axios.get(url)\n                        .then(function (response) {\n                                p.photos = response.data.data\n                                p.message = null\n                                p.searchResult = response.data.total + ' image(s)'\n                                if (typeof callback != 'undefined') callback.call()\n                        })\n                        .catch(function (error) {\n                                p.message = 'Request failed with ' + error.response.status + ': ' + error.response.statusText\n                                if (error.response.status == '403') { // special helpful message for loggedout situations\n                                        p.message += '. Make sure you are logged in or refresh the page.'\n                                }\n                        })\n                },\n\n\n                deleteSelected() {\n\n                    // let q = this\n\n                    this.$emit('deleted', this.selectedPhoto)\n\n                    // util.confirm(\"Delete photo?\",  \"This will permanently delete this media. This action is unrecoverable.\", function (){\n\n                    //             let p = q\n                    //             axios.delete('/api/media/' + q.selectedPhoto.id)\n                    //             .then(function(response) {\n                    //                     util.notifySuccess('Photo deleted')\n\n                    //                     let l = p.photos.length\n                    //                     for (let i = 0; i < l; i++) {\n                    //                             if (p.photos[i].id === p.selectedPhoto.id) {\n\n                    //                                     p.photos.splice(i, 1)\n                    //                                     break\n                    //                             }\n                    //                     }\n                    //                     p.pane = 'gallery'\n                    //             })\n                    // })\n                },\n\n\n                // This is an experimental function that enables\n                // lazy-loading.\n                enableLazyLoad: function () {\n                        let images = document.querySelectorAll('.mg-photo');\n\n                        const config = {\n                                root: document.querySelector('.top-panel'),\n                                // If the image gets within 100px in the Y axis, start the download.\n                                rootMargin: '0px 0px 50px 0px'\n                        };\n\n                        // check if intersection observer is supported via browser\n                        if (!('IntersectionObserver' in window) || this.lazyload === false) {\n                                // if not, just load all immediately\n                                Array.from(images).forEach(function(image) {\n                                        console.log('IntersectionObserver unsupported loading')\n                                        if(! image.src) image.src = image.dataset.src\n                                })\n                        } else {\n                                // The observer is supported\n                                let observer = new IntersectionObserver(function (entries) {\n                                        // Loop through the entries\n                                        entries.forEach(image => {\n                                                // Are we in viewport?\n                                                if (image.isIntersecting) {\n                                                        // Stop watching and load the image\n                                                        // console.log('Loading: ' + image.target.dataset.src)\n                                                        observer.unobserve(image.target)\n                                                        // console.log(image.target.src)\n                                                        image.target.src = image.target.dataset.src\n                                                }\n                                        })\n                                }, config)\n\n                                // start observing...\n                                images.forEach(image => {\n                                        if(! image.src) {\n                                            observer.observe(image)\n                                        }\n                                })\n                        }\n                },\n        }\n}\n</script>\n\n<style>\n        .thumbnail-container {\n\n        }\n        .thumbnail {\n            height: 100px;\n            overflow: hidden;\n        }\n\n        .postcard-container {\n\n\n        }\n\n        .postcard  {\n\n        }\n\n        .mg-photo {\n            width: 100%;\n            height: 100%;\n            object-fit: cover;\n        }\n\n</style>\n"]}, media: undefined });

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
