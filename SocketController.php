<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\User;

use Redis;

use View;

class SocketController extends Controller
{
    public function SendMessege () {
      
        try
        {
            $data = [
                "id"   => "id",
                "user" => "user",
                "msg"  => "msg",
            ];

            $redis = Redis::connection()->publish( 'message',(json_encode($data)));

            return response('messege send');

        } 
        catch (\Exception $e)
        {
            //Se define los parametros de entrada para la clase Respuesta
            $response->status = '300';
            $response->msg = 'error.';
            $response->ExceptionMsg = $e->getMessage();

            return response()->json($response);
        }
        
    }

}
