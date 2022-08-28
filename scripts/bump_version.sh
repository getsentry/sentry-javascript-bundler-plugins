echo version $1
yarn nx run-many --target bump:version $1 --all &&
yarn version --no-git-tag-version --new-version $1