describe("PiePie", function() {
  var piepie;

  beforeEach(function() {
    piepie = new PiePie({
				x: 600,
				y: 100,
				width: 350,
				height: 300,
				background: "#eee",
				colors: ["#265434", "#3F99D2", "#ED23CD", "#B6EBD9", "#68AB79"],
				dataURL: "http://localhost/piepie.json",
				endLoad: function(){
					//piepie.setViewBox(1,1,1,1,1);
				}
			});
  });

  it("should be able create instance", function() {
    expect(piepie).toBeDefined();
  });
/*
  describe("when song has been paused", function() {
    beforeEach(function() {
      player.play(song);
      player.pause();
    });

    it("should indicate that the song is currently paused", function() {
      expect(player.isPlaying).toBeFalsy();

      // demonstrates use of 'not' with a custom matcher
      expect(player).not.toBePlaying(song);
    });

    it("should be possible to resume", function() {
      player.resume();
      expect(player.isPlaying).toBeTruthy();
      expect(player.currentlyPlayingSong).toEqual(song);
    });
  });

  // demonstrates use of spies to intercept and test method calls
  it("tells the current song if the user has made it a favorite", function() {
    spyOn(song, 'persistFavoriteStatus');

    player.play(song);
    player.makeFavorite();

    expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
  });
*/
  /*
  //demonstrates use of expected exceptions
  describe("#resume", function() {
    it("should throw an exception if song is already playing", function() {
      player.play(song);

      expect(function() {
        player.resume();
      }).toThrow("song is already playing");
    });
  });
  */
});