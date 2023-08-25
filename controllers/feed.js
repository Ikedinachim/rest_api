const {validationResult} = require('express-validator')
const fs = require('fs')
const path = require('path')
const User = require('../models/user')
const Post = require('../models/post')
exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page  || 1;
    const perPage = 2;
    let totalNo  = 0;
    try{
        totalNo = await Post.countDocuments({creator:req.userId})
        
        const posts = await Post.find({creator:req.userId}).limit(perPage).skip((currentPage - 1) * perPage)
        
        res.status(200).json({
                message: 'Posts fetched Successfully',
                posts: posts,
                totalItems: totalNo
            })

    } catch(err){
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)

    }
    
  

  
}

exports.createPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;
    const id = new Date().toISOString()
    const file = req.file;
    const errors = validationResult(req)
    let creator;
    if (!errors.isEmpty()) {
        // there are validation errors
        const error = new Error('Validation failed, entered incorrect data')
        error.statusCode = 422;
        throw error
        // return res.status(422).json({
        //     message: 'Creating a Post Failed!',
        //     errors: errors.array()
        // })
        
    }
    if (!file) {
        const error = new Error('Image upload is required!')
        error.statusCode = 422;
        console.log('fdaf');
        throw error;
    }
    console.log(req.file.path);
    console.log('fdaf');
    
    const post = new Post({
        title: title,
        content: content,
        imageUrl: file.path.replace('\\', '/'),
        creator: req.userId
    })
    post.save().then(result => {
            User.findById(req.userId).then(user => {
                creator = user;
                user.posts.push(post)
                return user.save()
            }).then(result => {
                res.status(201).json({
                    message: 'Post Created Successfully',
                    creator: {
                        _id: creator._id,
                        name: creator.name, 
                    },
                    post:  post})

            })

            
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            console.log(err)
            next(err)
        })
    }
    exports.getPost  = (req, res, next) => {
        console.log('getting post');
        const postId = req.params.postId;
  
    Post.findById(postId)
    .then(post => {
    if (!post) {
        const error = new Error('Post Not Found');
        error.statusCode = 404
        throw error        
    }
    res.status(200).json({
        message: 'Post Retrieved Successfully',
        post: post,
    })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
            
        }
        next(err)
    })
}

exports.editPost = (req, res, next) => {
    const id = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    const newImage = req.file;
    const error = validationResult(req);
    if (!error.isEmpty()) {
       const err = new Error('Validation failed')
       err.statusCode = 422;
       throw err;
    }
   
    if (!imageUrl && !newImage) {
        const error = new Error('No file picked');
        error.statusCode = 422
        throw error   
    }
    Post.findById(id).
    then(post => {
        console.log(post, id);
        if (!post) {
            const error = new Error('Post Not Found');
            error.statusCode = 404
            throw error   
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorized');
            error.statusCode = 401
            throw error 
        }
         if (newImage) {
        deleteFile(post.imageUrl)
         imageUrl = newImage.path.replace('\\', '/');  
    }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        return post.save()

    }).then(result => {
        res.status(200).json({
            message: 'Post Updated Successfully',
            result: result
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })

   

}

exports.deletePost = (req, res, next) => {
    id = req.params.postId;
    Post.findById(id)
    .then(post => {
        if (!post) {
            const error = new Error('Post Not Found');
            error.statusCode = 404
            throw error  
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorized');
            error.statusCode = 403
            throw error 
        }
        deleteFile(post.imageUrl)
        return Post.findByIdAndDelete(post._id);
    }).then(result => {
     return   User.findById(req.userId)
     
    }).then(user => {
        user.posts.pull(id)
        return user.save()
        
    }).then(result => {
        
        res.status(200).json({
            message: 'Post deleted Successfully',
            result: result
        })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })

}


const deleteFile  = (filePath) => {
    const fPath = path.join(__dirname, '..', filePath)
    fs.unlink(fPath, (err) => {
        if (err) {
            const error = new Error('Failed to delete File from Server' + err)
            error.statusCode = 422;
            throw error;
        }
        console.log('File deleted')
    })
}