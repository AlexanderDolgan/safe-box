'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),           //Streaming

    pug = require('gulp-pug'),               // Gulp plugin for compiling Pug templates (old jade)

    sass = require('gulp-sass'),
    prefixer = require('gulp-autoprefixer'),
    cleancss = require('gulp-clean-css'),    //Minify css with clean-css.

    uglify = require('gulp-uglify'),         //Minify files with UglifyJS.
    sourcemaps = require('gulp-sourcemaps'),

    imagemin = require('gulp-imagemin'),      //Minify PNG, JPEG, GIF and SVG images
    pngquant = require('imagemin-pngquant'),
    svgSprite = require('gulp-svg-sprite'),  //Create SVG sprites with PNG fallbacks

    rigger = require('gulp-rigger'),          //Rigger is a build time include engine for Javascript,
                                              // CSS, CoffeeScript and in general any type of text file
                                              // that you wish to might want to "include" other files into.
    plumber = require('gulp-plumber'),        // Prevent pipe breaking caused by errors from gulp plugins
    rimraf = require('rimraf'),               //The UNIX command rm -rf for node. - clean
    gutil = require('gulp-util'),             //Utility functions for gulp plugins
    concat = require('gulp-concat'),          //Concatenates files
    filter = require("gulp-filter"),          //Filter files in a vinyl stream
    rename = require('gulp-rename'),          //Rename files

    browserSync = require("browser-sync"),//Live CSS Reload &amp; Browser Syncing
    reload = browserSync.reload;

var path = {
    //export paths
    build: {
        fonts: 'build/fonts/',
        img: 'build/images/',
        icons: 'src/images/assets/icons/sprites',
        //html: 'build/',
        pug: 'build/',
        js: 'build/js/',
        css: 'build/style'
    },
    //source paths
    src: {
        fonts: 'src/fonts/**/*.*',
        img: 'src/img/**/*.*',
        icons: 'src/img/assets/icons/*.*',
        //html: 'src/*.html',
        pug: 'src/pug/*.pug',
        js: 'src/js/*.js',
        css: 'src/style/*.scss'
    },
    //whatcher paths
    watch: {
        fonts: 'src/fonts/**/*.*',
        img: 'src/img/**/*.*',
        icons: 'src/img/assets/icons/*.*',
        //html: 'src/**/*.html',
        pug: 'src/pug/**/*.pug',
        js: 'src/js/**/*.js',
        css: 'src/style/**/*.scss'
    },
    clean: './build',
    util: 'src/js/util'
};

//config for the web server
var config = {
    server: {
        baseDir: "./build"
    },
    //tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "heritage"
};


function onError(err) {
    console.log(err);
    this.emit('end');
}

gulp.task('pug:build', function () {
    gulp.src(path.src.pug)
        .pipe(pug({pretty: true}))
        .pipe(gulp.dest(path.build.pug))
        .on('error', function (err) {
            gutil.log(err.message);
        })
        .pipe(reload({stream: true}));

});

//gulp.task('html:build', function () {
//    gulp.src(path.src.html)
//        .pipe(rigger())
//        .pipe(gulp.dest(path.build.html))
//        .pipe(reload({stream: true}));
//});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(sourcemaps.init())
        .pipe(rigger())
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(sourcemaps.write('../js'))
        .pipe(gulp.dest(path.build.js))
        .on('error', function (err) {
            gutil.log(err.message);
        })
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    gulp.src(path.src.css)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(rigger())
        .pipe(prefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        // .pipe(rename({suffix: '.min'}))
        // .pipe(cleancss())
        .pipe(sourcemaps.write('../style'))
        .pipe(gulp.dest(path.build.css))
        .on('error', function (err) {
            gutil.log(err.message);
        })
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});


// // Config svg sprite
// var svgConfig = {
//     mode                    : {
//         inline              : true,     // Prepare for inline embedding
//         symbol              : true      // Create a «symbol» sprite
//     }
// };

// gulp.task('svgSprite:build', function () {
//     gulp.src('src/img/assets/icons/*.svg')
//         .pipe(svgSprite(svgConfig))
//         .pipe(gulp.dest('src/img/assets/'))
//         .on('error', function (err) {
//             gutil.log(err.message);
//         })
//         .pipe(reload({stream: true}));
// });

gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    //'html:build',
    'pug:build',
    'js:build',
    'style:build',
    'image:build',
    'fonts:build'
    // 'svgSprite:build'
]);

gulp.task('watch', function () {
    //watch([path.watch.html], function (event, cb) {
    //    gulp.start('html:build');
    //});
    watch([path.watch.pug], function (event, cb) {
        gulp.start('pug:build');
    });
    watch([path.watch.css], function (event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function (event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function (event, cb) {
        gulp.start('image:build');
    });
    // watch([path.watch.icons], function (event, cb) {
    //     gulp.start('svgSprite:build');
    // });
    watch([path.watch.fonts], function (event, cb) {
        gulp.start('fonts:build');
    });

});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);