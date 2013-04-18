<!DOCTYPE html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title>Tiro</title>
    <meta name="viewport" content="width=device-width">
    <link rel="stylesheet" href="css/style.css">
  </head>

  <body>
    <h1>Tiro yo</h1>
    
    <input id="url" type=URL placeholder="Enter a URL here">
    <button id="send_url">Write URL</button>
    <br><br>
    
    
    <?php

    function buildBaseString($baseURI, $method, $params) {
        $r = array();
        ksort($params);
        foreach($params as $key=>$value){
            $r[] = "$key=" . rawurlencode($value);
        }
        return $method."&" . rawurlencode($baseURI) . '&' . rawurlencode(implode('&', $r));
    }

    function buildAuthorizationHeader($oauth) {
        $r = 'Authorization: OAuth ';
        $values = array();
        foreach($oauth as $key=>$value)
            $values[] = "$key=\"" . rawurlencode($value) . "\"";
        $r .= implode(', ', $values);
        return $r;
    }

    $url = "https://api.twitter.com/1.1/favorites/list.json";
  
    require "access.php";
    $oauth = array( 'count' => 200,
                    'oauth_consumer_key' => $consumer_key,
                    'oauth_nonce' => time(),
                    'oauth_signature_method' => 'HMAC-SHA1',
                    'oauth_token' => $oauth_access_token,
                    'oauth_timestamp' => time(),
                    'oauth_version' => '1.0');

    $base_info = buildBaseString($url, 'GET', $oauth);
    $composite_key = rawurlencode($consumer_secret) . '&' . rawurlencode($oauth_access_token_secret);
    $oauth_signature = base64_encode(hash_hmac('sha1', $base_info, $composite_key, true));
    $oauth['oauth_signature'] = $oauth_signature;

    // Make Requests
    $header = array(buildAuthorizationHeader($oauth), 'Expect:');
    $options = array( CURLOPT_HTTPHEADER => $header,
                      //CURLOPT_POSTFIELDS => $postfields,
                      CURLOPT_HEADER => false,
                      CURLOPT_URL => $url . '?count=200',
                      CURLOPT_RETURNTRANSFER => true,
                      CURLOPT_SSL_VERIFYPEER => false);

    $feed = curl_init();
    curl_setopt_array($feed, $options);
    $json = curl_exec($feed);
    curl_close($feed);

    $twitter_data = json_decode($json);


    function json_reader($json = '', $indentStr = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", $newLine = "<br/>") {

            $result    = "";          // Resulting string
            $indention = "";          // Current indention after newline
            $pos       = 0;           // Indention width
            $escaped   = false;       // FALSE or escape character
            $strLen    = strlen($json);


            for ($i = 0; $i < $strLen; $i++) {
                // Grab the next character in the string
                $char = $json[$i];

                if ($escaped) {
                    if ($escaped == $char) {
                        // End of escaped sequence
                        $escaped = false;
                    }

                    $result .= $char;
                    if ($char == "\\" && $i + 1 < $strLen) {
                        // Next character will NOT end this sequence
                        $result .= $json[++$i];
                    }

                    continue;
                }

                if ($char == '"' || $char == "'") {
                    // Escape this string
                    $escaped = $char;
                    $result .= $char;
                    continue;
                }

                // If this character is the end of an element,
                // output a new line and indent the next line
                if ($char == '}' || $char == ']') {
                    $indention = str_repeat($indentStr, --$pos);
                    $result .= $newLine . $indention;
                }

                // Add the character to the result string
                $result .= $char;

                // If the last character was the beginning of an element,
                // output a new line and indent the next line
                if ($char == ',' || $char == '{' || $char == '[') {
                    if ($char == '{' || $char == '[') {
                        $indention = str_repeat($indentStr, ++$pos);
                    }
                    $result .= $newLine . $indention;
                }
            }

            return  $result;
    }

    if (!empty($twitter_data)) :
    	foreach ($twitter_data as $tweet) : 
    		$datetime = $tweet->created_at;
    		$date = date('M d, Y', strtotime($datetime));
    		$time = date('g:ia', strtotime($datetime));
    		$tweet_text = $tweet->text;

    		// check if any entites exist and if so, replace then with hyperlinked versions
    		if (!empty($tweet->entities->urls) || !empty($tweet->entities->hashtags) || !empty($tweet->entities->user_mentions)) {
    			foreach ($tweet->entities->urls as $url) {
    				$find = $url->url;
    				$replace = '<a href="'.$find.'">'.$find.'</a>';
    				$tweet_text = str_replace($find,$replace,$tweet_text);
    			}

    			foreach ($tweet->entities->hashtags as $hashtag) {
    				$find = '#'.$hashtag->text;
    				$replace = '<a href="http://twitter.com/#!/search/%23'.$hashtag->text.'">'.$find.'</a>';
    				$tweet_text = str_replace($find,$replace,$tweet_text);
    			}

    			foreach ($tweet->entities->user_mentions as $user_mention) {
    				$find = "@".$user_mention->screen_name;
    				$replace = '<a href="http://twitter.com/'.$user_mention->screen_name.'">'.$find.'</a>';
    				$tweet_text = str_ireplace($find,$replace,$tweet_text);
    			}
    		}
    	?>

    	<div class="entry tweet">
    		<span><?php echo $tweet_text; ?></span>
    		<div class="meta">
    			<small><?php echo $time; ?>, <?php echo $date; ?></small>
    		</div>
    	</div>

<?php
      endforeach;
    endif;


    
    echo "<br><br>";

    echo json_reader($json);

    ?>


    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    
    <script>
    
    $('#send_url').click(function(){
      var url = $('#url').val();
      if (url) {
        
      }
    });
    
    </script>
    
  </body>