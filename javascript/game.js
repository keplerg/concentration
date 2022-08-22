/* Concentration Game 
 * Version: v1.0.4
 * Date: 2020-12-09
 * Copyright (c) 2020 Kepler Gelotte
 * License: MIT
*/
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class Sprite {
  constructor(size = 'large', bg_color = '#fff', img = 'images/house-plants.png', top = 0, left = 0, height = 155, width = 155, columns = 6, rows = 3, x_increment = -180, y_increment = -180) {
    this.size = size;
    this.bg_color = bg_color;
    this.img = img;
    this.top = top;
    this.left = left;
    this.height = height;
    this.width = width;
    this.columns = columns;
    this.rows = rows;
    this.x_increment = x_increment;
    this.y_increment = y_increment;
    this.count = this.rows * this.columns;
  }
}

class Board {
  constructor(size = 'large') {
    if (size == 'small') {
      this.columns = 8;
      this.rows = 3;
    } else if (size == 'large') {
      this.columns = 13;
      this.rows = 4;
    } else {
      console.log(`board size ${size} not recognized`);
      return false;
    }
    this.board = [];
    let count = this.rows * this.columns;
    for (let i = 0; i < count; i++) {
      this.board[i] = -1;
    }
    this.timeout = false; // timer function handle
    this.delay = 2000; // 2 seconds
    this.game_over = false;
    this.flipping = false;
    this.time = 0;
    this.seen = [];
    this.matches = [];
    this.flips = [];
    this.tries = 0;
    this.misses = 0;
    this.score = 0;

    let table_class = "twenty-four";
    if (size == 'large') {
        table_class = "fifty-two";
    }
    let html = `      <table class="cards ${table_class}">
      <tbody>`;
    for (let row = 0; row < this.rows; row++) {
      html += `            <tr>`;
      for (let column = 0; column < this.columns; column++) {
        html += `              <td class="card" data-row="${row}" data-column="${column}"><div class="front"></div><div class="back"></div></td>`;
        count++;
      }
      html += `            </tr>`;
    }
    html += `
      </tbody>
    </table>`;
    $('#board').append(html);
  }

  init(sprite = new Sprite()) {
    this.sprite = sprite;
    let count = (this.rows * this.columns) / 2;
    let pieces = [];
    // choose random sprites for the cards
    for (let i = 0; i < count; i++) {
      let piece = getRandomInt(sprite.count);
      while (pieces.indexOf(piece) >= 0) {
        piece = getRandomInt(sprite.count);
      }
      pieces[i] = piece;
    }
    // populate the board with matching sprites
    let piece_count = (this.rows * this.columns) / 2;
    let board_count = this.rows * this.columns;
    for (let i = 0; i < piece_count; i++) {
        // randomly assign a sprite to a card
        let card = getRandomInt(board_count);
        while (this.board[card] >= 0) {
          card = getRandomInt(board_count);
          /*
          card++;
          if (card >= board_count) {
            card = 0;
          }
          */
        }
        this.board[card] = pieces[i];
        let piece = pieces[i];
        let row = parseInt(card / this.columns);
        let column = parseInt(card % this.columns);
        let piece_x = parseInt(piece % this.sprite.columns) * this.sprite.x_increment + this.sprite.left;
        let piece_y = parseInt(piece / this.sprite.columns) * this.sprite.y_increment + this.sprite.top;
        $('.card[data-row="'+row+'"][data-column="'+column+'"] .front').css('background-image', 'url('+this.sprite.img+')')
          .css('background-color', this.sprite.bg_color)
          .css('background-repeat', 'no-repeat')
          .css('background-position-x', piece_x)
          .css('background-position-y', piece_y)
          .css('height', this.sprite.height)
          .css('width', this.sprite.width)
        ;

        // now randomly add the matching card
        card = getRandomInt(board_count);
        while (this.board[card] >= 0) {
          card++;
          if (card >= board_count) {
            card = 0;
          }
        }
        this.board[card] = pieces[i];
        piece = pieces[i];
        row = parseInt(card / this.columns);
        column = parseInt(card % this.columns);
        piece_x = parseInt(piece % this.sprite.columns) * this.sprite.x_increment + this.sprite.left;
        piece_y = parseInt(piece / this.sprite.columns) * this.sprite.y_increment + this.sprite.top;
        $('.card[data-row="'+row+'"][data-column="'+column+'"] .front').css('background-image', 'url('+this.sprite.img+')')
          .css('background-color', this.sprite.bg_color)
          .css('background-repeat', 'no-repeat')
          .css('background-position-x', piece_x)
          .css('background-position-y', piece_y)
          .css('height', this.sprite.height)
          .css('width', this.sprite.width);
        ;
    }
  }

  flip(elem) {
      let row = parseInt(elem.attr('data-row'));
      let column = parseInt(elem.attr('data-column'));
      let piece = this.board[(row * this.columns + column)];
      if (this.flipping || this.flips.length >= 2 || this.matches.indexOf(piece) >= 0) {
        return false;
      }
      this.flips.push(elem);
      if (this.tries == 0 && this.flips.length == 1) {
        this.timeout = setTimeout('board.timer()', 1000);
      }
      if (this.flips.length == 2) {
        this.tries++;
        $('.tries').html(this.tries);
        row = parseInt(this.flips[0].attr('data-row'));
        column = parseInt(this.flips[0].attr('data-column'));
        let first_piece = this.board[(row * this.columns + column)];
        if (first_piece == piece) {
          this.matches.push(piece);
          $('.matches').html(this.matches.length);
          if (this.matches.length == (this.rows * this.columns) / 2) {
            if (this.size == 'large') {
              this.score = 18000 - this.time * 100;
            } else {
              this.score = 30000 - this.time * 100;
            }
            $('.score').html(this.score);
            setTimeout('board.over()', this.delay * 2);
          }
          this.reset();
        } else {
          if (this.seen.indexOf(first_piece) < 0) {
            this.seen.push(first_piece);
          } else {
            this.misses++;
            $('.misses').html(this.misses);
          }
          if (this.seen.indexOf(piece) < 0) {
            this.seen.push(piece);
          }
          setTimeout('board.unflip()', this.delay);
        }
      }
      return true;
  }

  reset() {
    this.flips = [];
  }

  unflip() {
    this.flipping = true;
    this.flips.forEach(elem => $(elem).flip(true));
    this.flips = [];
    this.flipping = false;
  }

  timer() {
    if (! this.game_over) {
        this.time++;
        $('.time').html(this.time);
        this.timeout = setTimeout('board.timer()', 1000);
    }
  }

  over() {
    this.game_over = true;
    if (this.score > 5000 && this.misses < 5) {
      $('.awesome').css('display','block').show();
      $('#overlay').show();
      setTimeout("$('#overlay').fadeOut(1000);", 5000);
      setTimeout("$('.awesome').css('display','none');", 10000);
    } else if (this.score > 1000 && this.misses < 10) {
      $('.good-job').css('display','block').show();
      $('#overlay').show();
      setTimeout("$('#overlay').fadeOut(1000);", 5000);
      setTimeout("$('.good-job').css('display','none');", 10000);
    } else if (this.score < -20000 || this.misses > 35) {
      $('.oh-no').css('display','block').show();
      $('#overlay').show();
      setTimeout("$('#overlay').fadeOut(1000);", 5000);
      setTimeout("$('.oh-no').css('display','none');", 10000);
    } else if (this.score < 0 || this.misses > 20) {
      $('.try-again').css('display','block').show();
      $('#overlay').show();
      setTimeout("$('#overlay').fadeOut(1000);", 5000);
      setTimeout("$('.try-again').css('display','none');", 10000);
    } else {
      $('.ok-job').css('display','block').show();
      $('#overlay').show();
      setTimeout("$('#overlay').fadeOut(1000);", 5000);
      setTimeout("$('.ok-job').css('display','none');", 10000);
    }
  }

  delete() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    $('.cards').remove();
  }
}
