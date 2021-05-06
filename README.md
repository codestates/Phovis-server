# Awesome Project Build with TypeORM

Phovis client를 위한 Phovis server입니다.

# Phovis App (Recommend Photo Visiting site)

REST API

- USER SIGH IN / SIGN OUT/ LOGIN / LOGOUT

- PHOTCARD GET / POST / PUT / DELETE

- content GET / POST / PUT / DELETE 

- BookMark PUT

- Favourite PUT

- Tag GET


## Main Function

1. Upload Your Photos

- Best Photo upload & Write your story of the place Where take the best photo.

2. follow sombody who u Like

3. like & bookmark tool at the photo that You want

4. Recommend Your Place where take the best photo

## stack


>Express (https, fs)
>
>axios(REST API)
>
>aws-sdk(AWS S3)
>
>jwt(token generate)
>
>Typeorm (Orm)
>
>mysql(database)

## start APP

Steps to run this project:

- install

2. `npm install & yarn install`

- setup

3. fill `ormconfig.json` database info
4. `npm run generate:mig`
5. `npm run migration`
6. `npm run seed` insert Seed Data
7. `npm run start` run nodemon server
