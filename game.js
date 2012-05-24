//Config etc.
var VideoPuzzle = {
	//canvas element
	canvas: 		document.getElementById('canvas'),
	//array for keeping puzzle pieces
	pieces: 		[],
	//size of the video
	size: 			500,
	//are we dragging now?
	dragging: 		false,
	//reference to the already dragged element
	drElem: 		null,
	//previous position of alredy dragged element
	prevPos: 		{},
	//where exactly you clicked in the piece?
	offsedo: 		{},
	//how many pieces in one row?
	//total pieces number is howmanyPieces * howManyPIeces
	howManyPieces: 	3,
	//boom effect angle
	angle: 			0,
	
	//init everything we need
	init: function VideoPuzzle_init(){
		//get the context
		this.ctx = this.canvas.getContext('2d');
		//set the size of the canvas
		this.canvas.width = this.canvas.height = this.size;
		//hide it
		canvas.style.display = "none";
		//get the reference to the vdeo element
		this.video = document.getElementById('video');
		//are we in Webkit or in Opera?
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
		//does our browser support getUserMedia?
		if (navigator.getUserMedia){
			//get the video from the webcam and set callbacks
			navigator.getUserMedia({video:true}/*"video"*/, successCallback, errorCallback);
			//everything is OK
			function successCallback(stream){
				//are we in Webkit?
				if (window.webkitURL) {
					this.video.src = window.webkitURL.createObjectURL(stream);
				//or in Opera?
				} else {
					this.video.src = stream;
				}
			}
			//something goes wrong
			function errorCallback(error){
			}
		}
		//call the main loop function
		this.main();
	},
	
	//main loop function
	main: function VideoPuzzle_main() {
		//start displaing the video on separate pieces
		this.tick();
		
		//add drag Events
		document.body.addEventListener('mousemove', this.dragAction.bind(this), false);
		document.body.addEventListener('mouseup', this.dropAction.bind(this), false);
		
			//how many collumns
		var	xPieces,
			//how many rows
			yPieces = xPieces = this.howManyPieces,
			//width of the piece
			pieceW = 0|this.size/xPieces,
			//height of the piece
			pieceH = 0|this.size/yPieces,
			//position of the piece
			xOff = 0, 
			yOff = 0-pieceH;
			
			//how many pieces left
			this.properPieces = xPieces*yPieces;
			
		for (var i=0; i<xPieces*yPieces; i++) {
			
			//position of the piece
			if (i%xPieces === 0) {
				yOff += pieceH;
				xOff = 0;
			} else {
				xOff += pieceW;
			}
			
			//create single piece
			this.temp = document.createElement('canvas');
			//some data for the fancy BOOM
			this.temp.dataset['centerX'] = 600;
			this.temp.dataset['centerY'] = 200;
			//piece size
			this.temp.width = pieceW;
			this.temp.height = pieceH;
			//redrawing (pasting the part of the video), function
			this.temp.drawMe = (function(temp, x, y, canvas){	
				return function(){
					temp.getContext('2d').drawImage(canvas, x, y, pieceW, pieceH, 0, 0, pieceW, pieceH);
				}
			})(this.temp, xOff, yOff, this.canvas);
			
			//remember the order of the pieces before sort
			this.temp.dataset['order'] = i;

			//release dragging event
			this.temp.addEventListener('mousedown', this.downAction.bind(this), false);
			//add the piece to the pieces array
			this.pieces.push(this.temp);

		}

		//sort the pieces randomly
		this.pieces.sort(function(){ return Math.random()-0.5});
		
		//calulatethe new position
		xOff = 0; 
		yOff = 0-pieceH;
		
		this.pieces.forEach(function(element, index){
			//append the piece to the document
			document.body.appendChild(element);
			if (index%xPieces === 0) {
				yOff += pieceH;
				xOff = 0;
			} else {
				xOff += pieceW;
			}
			element.setAttribute('style', 'top:' + yOff + 'px; left:' + xOff + 'px');

			//create final place for the piece
			this.temp = document.createElement('div');
			document.body.appendChild(this.temp);
			this.temp.dataset['order'] = index;
			this.temp.setAttribute('style', 'top:' + yOff + 'px; left:' + (parseInt(xOff, 10) + this.canvas.width*1.2) + 'px;width:' + pieceW + 'px;height:'+ pieceH + 'px;');
		});
	},
	
	//updating the video on given frame
	tick: function VideoPuzzle_tick() {
		setTimeout(this.tick.bind(this), 10);
	
		if (this.video.readyState === this.video.HAVE_ENOUGH_DATA){
			this.ctx.drawImage(this.video, 0, 0, 500, 500);
		}
		
		this.pieces.forEach(function(element){
			element.drawMe();
		});
	},
	
	//some fancy effect when we finish the puzzle
	boom:  function VideoPuzzle_boom(){
		
		this.pieces.forEach(function(element, index){
			element.style.left = parseInt(element.dataset['centerX'], 10) + Math.cos(this.angle*(Math.PI/180))*200 + 'px';
			element.style.top = parseInt(element.dataset['centerY'], 10) + Math.sin(this.angle*(Math.PI/180))*200 + 'px';
			this.angle += 45;
		}.bind(this));

		document.getElementsByTagName('h1')[0].style.fontSize = ~~(Math.random()*100) + 'px';

		setTimeout(this.boom.bind(this), 1000/33);
	},
	
	//what happens when we start dragging...
	downAction: function VideoPuzzle_downAction(e) {
		this.dragging = true;
		this.drElem = e.target;
		this.prevPos.x = e.target.style.left;
		this.prevPos.y = e.target.style.top;
		this.drElem.style.zIndex = 10000;
		this.drElem.style.opacity = 0.6;
		this.drElem.style.pointerEvents = 'none';
		this.offsedo.x = parseInt(this.prevPos.x, 10) - e.pageX;
		this.offsedo.y = parseInt(this.prevPos.y, 10) - e.pageY;
	},

	//...during the dragging...
	dragAction: function VideoPuzzle_dragAction(e) {
		if (this.dragging && this.drElem) {
			this.drElem.style.top = e.pageY + this.offsedo.y + 'px';
			this.drElem.style.left = e.pageX + this.offsedo.x + 'px';
		}
	},

	//...and when we finish
	dropAction: function VideoPuzzle_dropAction(e) {

		if (this.drElem.dataset['order'] === e.target.dataset['order']) {

			this.drElem.style.top = e.target.style.top;
			this.drElem.style.left = e.target.style.left;
			this.properPieces--;
			
		} else {

			this.drElem.style.top = this.prevPos.y;
			this.drElem.style.left = this.prevPos.x;
			this.drElem.style.pointerEvents = 'auto';

		}
		
		this.drElem.style.opacity = 1;
		this.drElem.style.zIndex = 10;
		this.dragging = false;
		this.drElem = null;

		if (this.properPieces===0) {
			setTimeout(this.boom.bind(this), 800);
			document.getElementsByTagName('h1')[0].style.display = "block";
		}
	}
}

window.onload = VideoPuzzle.init();


