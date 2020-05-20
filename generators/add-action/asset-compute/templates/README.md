# Worker Template

This is a very simple example of a custom Asset Compute worker. It generates a rendition by simply copying the source file.

## Code

The key elements are
- [worker.js](worker.js) - nodejs action with the worker logic
- [manifest.yml](manifest.yml) - describes the Runtime action that gets deployed using `aio`
- [tests/](tests) - worker test cases

In the [manifest.yml](manifest.yml) the single action is set to be a web action and that it requires standard Adobe ID authentication & authorization:

```
packages:
  __APP_PACKAGE__:
    actions:
      worker:
        function: 'worker.js'
        runtime: 'nodejs:10'
        web: true
        annotations:
          require-adobe-auth: true
```

## Install

Requirements:

* [aio cli](https://github.com/adobe/aio-cli)
* [asset-compute plugin for aio](https://github.com/adobe/aio-cli-plugin-asset-compute) 
* Adobe IO Runtime namespace where you want to install the worker into
* `.env` file in the root directory with the credentials of the Runtime namespace, and these variables:
  - `AIO_RUNTIME_NAMESPACE` for the namespace name (`NAMESPACE` from `.wskprops`)
  - `AIO_RUNTIME_AUTH` for the namespace name (`AUTH` from `.wskprops`)
  - Make sure to not commit the `.env` file to git!

### Test

This runs the worker test cases in [tests](tests):

```
npm test
```

### Deploy

```
aio app deploy
```

The deployed version should look like this if you run `wsk action list`:

```
actions
/ns/worker-1.0.0/worker                           private sequence
/ns/worker-1.0.0/__secured_worker                 private nodejs:10
```

The `aio app deploy` output will show the URL of the worker:

```
https://ns.adobeioruntime.net/api/v1/web/worker-1.0.0/worker
```

### Use

To use the custom worker with the Asset Compute Service, include a new rendition in the [`/process` request](https://git.corp.adobe.com/nui/nui/blob/master/doc/api.md#process) with the `worker` field set to the worker URL:

```
"renditions": [
    {
        "worker": "https://ns.adobeioruntime.net/api/v1/web/worker-1.0.0/worker",
        "name": "image.jpg"
    }
]
```

(The `name` field is only needed for use in Asset Compute Devtool to display image renditions in the browser).
