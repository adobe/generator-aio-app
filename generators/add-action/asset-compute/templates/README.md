# Worker Template

This is a very simple example of a custom Asset Compute worker. It generates a rendition by simply copying the source file.

## Code

The key elements are
- `actions/<worker-name>/index.js` - nodejs action with the worker logic
- `manifest.yml` - describes the Runtime action that gets deployed using `aio`
- `test/asset-compute/<worker-name>/` - worker test cases

In the [manifest.yml](manifest.yml) the single action is set to be a web action and that it requires standard Adobe ID authentication & authorization:

```
packages:
  __APP_PACKAGE__:
    actions:
      worker:
        function: actions/worker/index.js
        runtime: 'nodejs:10'
        web: true
        annotations:
          require-adobe-auth: true
```

### Local Development
**Pre-requisites**

The following are required to use the developer tool:
- Access a [cloud storage container](https://github.com/adobe/asset-compute-devtool#1-s3-bucket-or-azure-blob-storage-credentials). (Currently we only support Azure Blob Storage and AWS S3).
- [Adobe I/O Console Project with Asset Compute and dependent services enabled](https://github.com/adobe/asset-compute-devtool#2-adobe-io-console-technical-integration).


#### Environment Variables
Make sure to set the required environment variables in the `.env` file:
- `AIO_runtime_namespace`: namespace name from the Firefly Project (should be filled in already if logged into console during `aio app init`)
- `AIO_runtime_auth`: namespace auth from the Firefly Project (should be filled in already if logged into console `aio app init`)
- `ASSET_COMPUTE_INTEGRATION_FILE_PATH`: path to credentials yaml for Adobe I/O Console project with Asset Compute and dependent services enabled
- One of the following sets of cloud storage credentials:
    ```
    # S3 credentials
    S3_BUCKET=
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_REGION=

    # Azure Storage credentials
    AZURE_STORAGE_ACCOUNT=
    AZURE_STORAGE_KEY=
    AZURE_STORAGE_CONTAINER_NAME=
    ```

#### Running the Application

To run the application, use the following command:
```bash
aio app run
```
This will deploy the action to Adobe I/O Runtime and start the development tool on your local machine. This tool is used for testing worker requests during development. Here is an example rendition request:

```json
"renditions": [
    {
        "worker": "https://1234_my_namespace.adobeioruntime.net/api/v1/web/example-custom-worker-master/worker",
        "name": "image.jpg"
    }
]
```

(The `name` field is only needed for use in Asset Compute Devtool to display image renditions in the browser).

#### Debug

To start the debugger, add necessary breakpoints and run the following command:
```bash
aio app run --local
```

#### Test

To test the worker, run the following command:
```bash
aio app test
```

#### Deploy

To deploy the worker, run the following command:
```bash
aio app deploy
```

To use the custom worker with the Asset Compute Service, include a new rendition in the `/process` request with the `worker` field set to the worker URL: