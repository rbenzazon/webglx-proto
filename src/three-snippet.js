vec3 transformedNormal = objectNormal;

vec3 transformed = vec3( position );
vec4 worldPosition = vec4( transformed, 1.0 );
worldPosition = instanceMatrix * worldPosition;

mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;

    transformedNormal = normalMatrix * transformedNormal;