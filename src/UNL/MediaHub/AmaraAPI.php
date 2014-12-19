<?php
class UNL_MediaHub_AmaraAPI
{
    public static $amara_username = false;
    public static $amara_api_key  = false;
    
    public function __construct()
    {
        
    }

    /**
     * Get the stream context for the request
     *
     * @param $method
     * @return resource
     */
    protected function getStreamContext($method, $content)
    {
        $options = array();
        
        $options['http'] = array(
            'timeout' => 2,
            'method'  => $method,
        );

        if (self::$amara_username && self::$amara_api_key) {
            $options['http']['header'] = "X-api-username: " . self::$amara_username . "\r\n" .
                "X-apikey: " . self::$amara_api_key . "\r\n";
        }
        
        if ($method == 'POST') {
            if (!isset($options['http']['header'])) {
                $options['http']['header'] = '';
            }
            $options['http']['header'] .= 'Content-type: application/x-www-form-urlencoded'."\r\n";
            $options['http']['content'] = http_build_query($content);
        }
        print_r($options);
        return stream_context_create($options);
    }

    /**
     * @param string $request_path the path and query string parameters after the base API endpoint
     * @return string
     */
    public function get($request_path)
    {
        return $this->request($request_path, 'GET');
    }
    
    public function post($request_path, $content)
    {
        return $this->request($request_path, 'POST', $content);
    }
    
    protected function request($request_path, $method = 'GET', $content = array()) {
        $url = 'https://www.amara.org/api2/partners/' . $request_path;
        print_r($url);
        $result = file_get_contents($url, false, $this->getStreamContext($method, $content));
        var_dump($result);
        return $result;
    }

    /**
     * @param string $media_url the full media URL
     * @return bool|mixed
     */
    public function getMediaDetails($media_url)
    {
        if (!$info_json = $this->get('videos/?video_url=' . $media_url . '&format=json')) {
            return false;
        }
        
        return json_decode($info_json);
    }
    
    public function createMedia($media_url)
    {
        return $this->post('videos/', array(
            'video_url' => $media_url,
            //'title' => 'test',
            //'primary_audio_language_code' => 'en-US',
        ));
    }

    /**
     * @param string $media_url the full media URL
     * @return bool|string
     */
    public function getCaptionEditURL($media_url)
    {
        $media_details = $this->getMediaDetails($media_url);

        if (!$media_details) {
            return false;
        }

        if ($media_details->meta->total_count == 0) {
            //create the media
            $result = $this->createMedia($media_url);
            
            //update the details
            $media_details = $this->getMediaDetails($media_url);
        }
        print_r($media_details);
        return 'http://amara.org/en/videos/' . $media_details->objects[0]->id . '/info';
    }

    /**
     * @param string $media_url the full media URL
     * @param string $format the format for the text track (srt or vtt)
     * @return bool|string
     */
    public function getTextTrack($media_url, $format = 'srt')
    {
        $media_details = $this->getMediaDetails($media_url);
        
        if (!$media_details) {
            return false;
        }
        
        if ($media_details->meta->total_count == 0) {
            return false;
        }

        return $this->get('videos/' . $media_details->objects[0]->id . '/languages/en/subtitles/?format='.$format);
    }
}