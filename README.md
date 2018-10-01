## Usage

```
docker run -d \
  --name=block-processor \
  -v <failed block storage>:/blocks \
  -e HOST=<https endpoint> \
  -e HOST_PATH=<https path> \
  -e FILTER=<| FS array of valid returns> \
  -e PGID=<UID> -e PUID=<GUID> \
  -p 3000:3000 \
  nanoflip/block-processor:latest
```
