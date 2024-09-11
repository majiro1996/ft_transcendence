let time_last = new Date().getTime();
let time_now = 0;
let delta_time = 0;
let counter = 0;

function DeltaTime()
{
	time_now = new Date().getTime();
	delta_time = time_now - time_last;
	time_last = new Date().getTime();
}
