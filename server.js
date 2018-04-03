const express = require('express');
const app = express();
const router = express.Router();
const mongoose = require('mongoose');
//constructor so we do a cap
const Pet = require('./models/pet');
const bodyParser = require('body-parser');

const connectionString = process.env.MONGODB_URI || 
'mongodb://localhost/updog';

mongoose.connect(connectionString);

//short circuiting - uses first value, if first value isn't there, use 4800
const port = process.env.PORT || 4800;

app.use(express.static('public'));

app.use(bodyParser.json());

router.route('/')
	.get((req,res) => {
		res.send('PETS!');
	});

router.route('/pets')
	//gets our pets
	.get((req,res) => {
		const params = req.query;
		const results = Pet.find();

		if (params.order_by === 'score'){
			results.sort({
				score: -1
			});
		}

		results.exec((err,dogs) => {
			if(err){
				res.status(400)
				.send({
					error:err
				});
				return;
			}
			res.status(200)
				.send(dogs);
		});
	})
	//creates our pets
	.post((req,res) => {
		const model = req.body;
		const pet = new Pet();

		pet.name = model.name;
		pet.score = 0;
		pet.photo = model.photo;
		pet.description = model.description;

		pet.save((err,doc) => {
			if (err){
				res.status(400)
				.send ({
					error: err
				});
				return;
			}

			res.status(200)
			.send(doc);
		});

	});

//before the endpoint use the router
router.route('/pets/:pet_id')
//req and res are callbacks
	.get((req,res) => {
		const petId = req.params.pet_id;

		//arguments usually error, document (error and the thing you want)
		Pet.findById(petId,(err,doc) => {
			if (err){
				res.status(400)
				.send ({
					error: err
				});
				//if there's an error, stop the execution of the function
				return;
			}
			// if no error send back the document itself
			res.status(200)
			.send(doc);
		});
	})
	.put((req,res) => {
		//get pet Id
		const petId = req.params.pet_id;
		Pet.findByIdAndUpdate(petId, {$inc :{score:1}},
			(err,doc) => {
				if(err){
					res.status(400)
					.send({
						error:err
					});
					return;
			}
			res.status(200)
			.send(doc);
		});
	})
	.delete((req,res) => {
		const petId = req.params.pet_id;
		Pet.findByIdAndRemove(req.params.pet_id, (err, pet) => {
        if (err) {
            res.status(400)
                .send({
                	error:err
                });
            	return;
	        }
	        
	        //no content to send back but all good (this is 204)
            res.sendStatus(204)

    })
});

//use our router to get api
app.use('/api', router);

app.listen(port);